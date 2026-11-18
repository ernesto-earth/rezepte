#!/usr/bin/env python3
"""E-035: Claude-Code-Hook (PreToolUse/Bash). Erlaubt nur die Branches main und prod.

Blockiert: neue Branches/Worktrees, Push auf andere Branches als main/prod, Force-Push,
Löschen von main/prod. Gibt Exit 2 mit Begründung zurück; sonst Exit 0.
"""
import json
import re
import shlex
import subprocess
import sys

ERLAUBT = {'main', 'prod'}


def stop(grund):
    print(f'E-035: {grund} Erlaubt sind nur die Branches main und prod '
          '(siehe CLAUDE.md, „Git, Vorprod und Prod“).', file=sys.stderr)
    sys.exit(2)


def ziel(ref):
    ref = ref.strip()
    for p in ('refs/heads/',):
        if ref.startswith(p):
            ref = ref[len(p):]
    return ref


def aktueller_branch():
    try:
        return subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], capture_output=True,
                              text=True, timeout=10).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return ''


def pruefe(args):
    # args: Wörter nach „git“ (globale Optionen wie -C pfad oder -c k=v werden übersprungen)
    i = 0
    while i < len(args) and args[i].startswith('-'):
        i += 2 if args[i] in ('-C', '-c', '--git-dir', '--work-tree') else 1
    if i >= len(args):
        return
    cmd, rest = args[i], args[i + 1:]
    if cmd in ('checkout', 'switch'):
        if any(a in ('-b', '-B', '-c', '-C', '--create', '--force-create', '--orphan') for a in rest):
            stop('Neue Branches sind nicht erlaubt.')
    elif cmd == 'branch':
        flags = [a for a in rest if a.startswith('-')]
        namen = [a for a in rest if not a.startswith('-')]
        if any(f in ('-d', '-D', '--delete') for f in flags):
            if ERLAUBT & {ziel(n) for n in namen}:
                stop('main und prod dürfen nicht gelöscht werden.')
        elif any(f in ('-m', '-M', '-c', '-C', '--move', '--copy') for f in flags) or (namen and not any(
                f in ('-l', '--list', '-a', '-r', '--all', '--remotes', '--contains', '--merged',
                      '--no-merged', '--points-at', '--show-current', '-v', '-vv') for f in flags)):
            stop('Neue oder umbenannte Branches sind nicht erlaubt.')
    elif cmd == 'worktree' and rest[:1] == ['add']:
        stop('Zusätzliche Worktrees sind nicht erlaubt.')
    elif cmd == 'push':
        if any(a in ('-f', '--force', '--force-with-lease', '--force-if-includes', '--mirror', '--all')
               or a.startswith('--force-with-lease=') for a in rest):
            stop('Force-Push, --all und --mirror sind nicht erlaubt.')
        loeschen = any(a in ('-d', '--delete') for a in rest)
        werte_mit_arg = {'-o', '--push-option', '--repo', '--receive-pack', '--exec'}
        pos, j = [], 0
        while j < len(rest):
            a = rest[j]
            if a in werte_mit_arg:
                j += 2
                continue
            if not a.startswith('-'):
                pos.append(a)
            j += 1
        specs = pos[1:]  # pos[0] ist der Remote
        if not specs:
            if loeschen:
                return
            b = aktueller_branch()
            if b and b not in ERLAUBT:
                stop(f'Push vom Branch „{b}“ ist nicht erlaubt.')
            return
        for spec in specs:
            if spec.startswith('+'):
                stop('Erzwungenes Überschreiben (+refspec) ist nicht erlaubt.')
            if spec.startswith('refs/tags/') or spec == '--tags':
                continue
            if loeschen:
                if ziel(spec) in ERLAUBT:
                    stop('main und prod dürfen nicht gelöscht werden.')
                continue
            if spec.startswith(':'):  # „:branch“ löscht den Branch auf dem Remote
                if ziel(spec[1:]) in ERLAUBT:
                    stop('main und prod dürfen nicht gelöscht werden.')
                continue
            src, _, dst = spec.partition(':')
            dst = ziel(dst or src)
            if dst == 'HEAD':
                dst = aktueller_branch()
            if dst not in ERLAUBT:
                stop(f'Push auf „{dst}“ ist nicht erlaubt.')


def main():
    try:
        data = json.load(sys.stdin)
    except ValueError:
        return
    if data.get('tool_name') not in (None, 'Bash'):
        return
    command = (data.get('tool_input') or {}).get('command') or ''
    if 'git' not in command:
        return
    for teil in re.split(r'&&|\|\||;|\||\n', command):
        try:
            woerter = shlex.split(teil, comments=True)
        except ValueError:
            woerter = teil.split()
        for k, w in enumerate(woerter):
            if w == 'git' or w.endswith('/git'):
                pruefe(woerter[k + 1:])
                break


if __name__ == '__main__':
    main()
