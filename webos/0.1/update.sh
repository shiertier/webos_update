# 以下是0.1的更新脚本
# 安装websshexp
cd /webos/web/apps
rm -rf /webos/web/apps/websshExp
cp -r /webos/update/0.1/websshExp .

# 更新index-init.js
cd /webos/web/apps/websshExp/js
rm -rf /webos/web/apps/websshExp/js/index-init.js
cp /webos/update/0.1/index-init.js .

# 更改java
apt update
apt install openjdk-8-jdk -y
rm -rf /webos/jre
echo "sucess" > /webos/update/v1.vision

rm -rf /webos/api/restart.sh
cp -r /webos/update/0.1/restart.sh /webos/api/restart.sh
cp -r /webos/update/0.1/restart_origin.sh /webos/api/restart_origin.sh
chmod +x /webos/api/0.1/restart.sh
chmod +x /webos/api/0.1/restart_origin.sh