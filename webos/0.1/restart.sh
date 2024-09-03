i=1
has=0
while [ $i -le 30 ]
do
wget -q -O - "http://127.0.0.1:8088/webos/api" 2>&1|grep -c 404
if [ $? -ne 0 ] ;then
  curl -sL  "http://127.0.0.1:8088/webos/api" 2>&1|grep -c 404
  if [ $? -ne 0 ] ;then
	sh restart.sh
    sleep 10
    let i++
    echo "检测webos状态中..."
  else
    let has++
    i=31
  fi
else
  let has++
  i=31
fi
done
if [ $has -ge 1 ] ;then
    echo "webos状态正常"
    else
    echo "webos状态不正常"
fi
