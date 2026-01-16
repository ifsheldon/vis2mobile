#!/usr/bin/env fish

set failures

for d in vega-*/
    if test -d "$d"
        echo "==> $d"
        pushd "$d" >/dev/null
        bun run build
        if test $status -ne 0
            set failures $failures (string trim -r -c "/" "$d")
        end
        popd >/dev/null
    end
end

if test (count $failures) -gt 0
    echo ""
    echo "Build failed in:"
    for f in $failures
        echo "  $f"
    end
    exit 1
else
    echo ""
    echo "All builds succeeded."
end
