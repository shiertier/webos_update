(function (){
    var initPage = function (){
        document.addEventListener("mousedown",function () {
            webos.inface.toTopWin(window);
        });
        Vue.app({
            data(){
                return {
                }
            },
            methods:{
                toOpenSsh:function (item){
                    const options = item.options;
                    const that = this;
                    if(!that.sshClient){
                        that.sshClient = {};
                    }
                    that.$nextTick(function (){
                        const termDiv = that.$refs["term"];
                        if(that.sshClient.client){
                            that.sshClient.client.close();
                            that.sshClient.client = null;
                        }
                        that.sshClient.data = options;
                        that.sshClient.div = termDiv;
                        that.openSsh();
                    });
                },
                initData:async function (){
                    const that = this;
                    let user = await webos.user.info();
                    if(user && user.isAdmin == 1){
                        let item = {options:{syncId:user.syncId,operate:"connect"}};
                        that.toOpenSsh(item);
                    }
                },
                init:async function (){
                    const that = this;
                    window.addEventListener("message",function (e){
                        let data = e.data;
                        if(data.action == "themeChange"){
                            that.setTheme(data.theme);
                        }
                    });
                    that.setTheme(localStorage.getItem("web_theme"));
                    await that.initData();
                    window.addEventListener("resize",function () {
                        var sshClient = that.sshClient;
                        if(!sshClient.client){
                            return;
                        }
                        if(!sshClient.term){
                            return;
                        }
                        utils.delayOneAction("webssh_term",1000,function(){
                            that.autoSize();
                        });
                    });
                },
                setTheme:function(theme){
                    theme = theme == "dark"?"dark":"";
                    document.querySelector("html").className = theme;
                },
                autoSize:function(){
                    const div = this.$refs["term"];
                    let height = window.innerHeight;
                    if(div.clientWidth > 0){
                        this.lastClientWidth = div.clientWidth;
                    }
                    let lineHeight = 20;
                    try{
                        lineHeight = parseInt(document.querySelector(".xterm-viewport").style["line-height"]);
                    }catch(e){

                    }
                    if(lineHeight <= 1 || isNaN(lineHeight)){
                        lineHeight = 20;
                    }
                    console.log(lineHeight);
                    this.sshClient.term.resize(parseInt(this.lastClientWidth/10),parseInt((height/lineHeight)));
                },
                openSsh:function (){
                    const that = this;
                    const options = that.sshClient.data;
                    that.sshClient.div.innerHTML = "";
                    that.sshClient.client = new WSSHClient();
                    var term = new Terminal({
                        cols: 1,
                        rows: 1,
                        cursorBlink: true, // 光标闪烁
                        cursorStyle: "block", // 光标样式  null | 'block' | 'underline' | 'bar'
                        scrollback: 10000, //回滚
                        tabStopWidth: 8, //制表宽度
                        screenKeys: true
                    });
                    that.sshClient.term = term;
                    term.on('data', function (data) {
                        //键盘输入时的回调函数
                        that.sshClient.client.sendClientData(data);
                    });
                    term.open(that.sshClient.div);
                    //在页面上显示连接中...
                    let title = new URL(window.location.href).searchParams.get("title");
                    if(!title){
                        title = "Connecting...";
                    }
                    term.write(title + '\r\n');
                    //执行连接操作
                    that.sshClient.client.connect({
                        onError: function (error) {
                            //连接失败回调
                            term.write('Error: ' + error + '\r\n');
                        },
                        onConnect: function () {
                            //连接成功回调
                            that.sshClient.client.sendInitData(options);
                        },
                        onClose: function () {
                            //连接关闭回调
                            term.write("\rconnection closed");
                        },
                        onData: function (data) {
                            //收到数据时回调
                            term.write(data);
                            if(!that.initSend){
                                that.initSend = true;
                                let delay = function(ms){
                                    return new Promise(function(success,error){
                                        setTimeout(function(){
                                            success(true);
                                        },ms);
                                    });
                                }
                                let comm = new URL(window.location.href).searchParams.get("comm");
                                if(comm){
                                    (async function(){
                                        let ml = comm+"\r";
                                        for(let i=0;i<ml.length;i++){
                                            await delay(20);
                                            that.sshClient.client.sendClientData(ml[i]);
                                        }
                                    })();
                                }
                            }
                        }
                    });
                    that.$nextTick(function(){
                        that.autoSize();
                    });
                }
            },
            mounted:function(){
                const that = this;
                that.init();
                setInterval(function (){
                    var sshClient = that.sshClient;
                    if(!sshClient.client){
                        return;
                    }
                    var socket = sshClient.client._connection;
                    if(!socket){
                        return;
                    }
                    if (socket.readyState == 1) {
                        socket.send("ping");
                    }
                },10000);
            }
        });
    };
    utils.documentReady(function (){
        utils.delayAction(function(){
            return window && window.webos;
        },function(){
            initPage();
        });
    });
})()