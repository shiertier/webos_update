#!/bin/bash

# 定义检查路径
CHECK_PATH="/webos/update/v1.vision"

# 检查路径是否存在
if [ ! -e "$CHECK_PATH" ]; then
    # 复制更新文件
    mkdir -p /webos/update
    cp -r webos/0.1 /webos/update/
    # 增加执行权限
    chmod +x /webos/update/0.1/update.sh
    # 执行更新脚本
    bash /webos/update/0.1/update.sh
else
    echo "$CHECK_PATH exists. Skipping update."
fi
