#!/usr/bin/env fish

set -l roots \
    /Users/zhiqiu/offline_code/research_ntu/vis2mobile/vega-baseline-projects \
    /Users/zhiqiu/offline_code/research_ntu/vis2mobile/vega-mobile-projects

for root in $roots
    if not test -d $root
        echo "Missing directory: $root"
        exit 1
    end
end

for dir in (find $roots -type d \( -name node_modules -o -name .next -o -name .venv \) -prune)
    rm -rf $dir
    echo "Deleted: $dir"
end
