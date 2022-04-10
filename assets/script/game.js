/**
 * 一些坐标信息：
 * 1.垃圾桶位置：x1=-145.25, x2=-46.75, x3=51.75, x4=150.25, y=-340
 */

const garbage_class_name = ['厨余垃圾', '可回收垃圾', '有害垃圾', '其他垃圾'];


cc.Class({
    extends: cc.Component,
    properties: {
        card_node: {
            default: null,
            type: cc.Node
        },
        card_prefab: {
            default: null,
            type: cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.score = 0; //  玩家得分
        this.time = 30;  // 游戏倒计时
        this.correct = false;   // 玩家分类正确
        this.continue_correct = 0;  // 玩家连续回答正确
        this.openid = null; // 获取主程序的openid，用来对数据库进行操作
        this.highest_score = 10;  // 用户历史最高分
        this.game_over = false;

    },

    start () {
        let count_down = cc.find('Canvas/background/time').getComponent(cc.Label)

        let self = this;
        let nick_name_node = cc.find('Canvas/background/nick_name');
        let nick_name = nick_name_node.getComponent(cc.Label);
        nick_name.string = 'GOAL:' + self.highest_score;

        this.schedule(function () {
            this.time--;
            count_down.string = 'Time:' + this.time + 's';

            // 如果倒计时结束
            if(this.time == 0){
                let grey_background = cc.find('Canvas/background/grey_background');
                grey_background.active = true;
                grey_background.setSiblingIndex(99);
                // let background_node = cc.find('Canvas/background');

                let window_node = cc.find('Canvas/background/window');
                window_node.setSiblingIndex(100);
                // 决定星星 #FFD700
                let star_left_sprite = cc.find('Canvas/background/window/star_left')
                let star_center_sprite = cc.find('Canvas/background/window/star_center')
                let star_right_sprite = cc.find('Canvas/background/window/star_right')
                switch (true) {
                    case this.score <= 3:
                        star_left_sprite.color = '#FFD700';
                    case this.score <= 5:
                        star_center_sprite.color = '#FFD700';
                    case this.score <= 10:
                        star_right_sprite.color = '#FFD700';
                }

                // 显示分享按钮
                let share_right_node = cc.find('Canvas/background/window/share_right');
                let share_left_node = cc.find('Canvas/background/window/share_left');
                share_right_node.active = true;
                share_left_node.active = true;

                // 修改window内两个文本的内容
                let title = cc.find('Canvas/background/window/title');
                title.getComponent(cc.Label).string = '游戏结束';
                title.color = new cc.color(250,128,114,0);

                let content = cc.find('Canvas/background/window/content');
                content.getComponent(cc.Label).string = '最后得分为:' + this.score;
                content.color = new cc.color(255,160,122,0);

                // 修改按钮label
                let quit_wechat_label = cc.find('Canvas/background/window/quitwechat/Background/Label').getComponent(cc.Label);
                quit_wechat_label.string = '退出游戏';

                if(self.highest_score < self.score){
                    console.log('test max point', self.highest_score, self.score);
                    self.setMaxPoint(self);
                }

                window_node.active = true;
                this.game_over = true;
                cc.director.pause();
            }
        },1)

        // 创建授权按钮，全屏透明（未授权）
        let sys_info = wx.getSystemInfoSync();  // 获取wx屏幕信息
        // 获取屏幕高和宽
        let screen_height = sys_info.screenHeight;
        let screen_width = sys_info.screenWidth;

        // let self = this; // 防止出错
        const wechatLogin = wx.createUserInfoButton({
            type: 'text',
            text: '',
            style:{
                left: 0,
                width: screen_width,
                top: 0,
                height: screen_height,
                lineHeight: 40,
                background: '#00000000',// 黑色全透明
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 0
            }
        });

        // 点击按钮事件
        wechatLogin.onTap((res) =>{
            // 打印测试
            console.log(res);

            // 获取用户信息, 加载头像
            let user_info = res.userInfo;
            // console.log(user_info);
            self.showWXIcon(user_info, self);


            // console.log('错误测试');
            // console.log('来自主程序的信息:', wx.getLaunchOptionsSync());
            // // 记录最高分
            // console.log('openid:', wx.getLaunchOptionsSync().referrerInfo.extraData.openid)

            self.getDataFromWechatMiniProgram(self);
            let nick_name_node = cc.find('Canvas/background/nick_name');
            let nick_name = nick_name_node.getComponent(cc.Label);
            nick_name.string = 'GOAL:' + self.highest_score;
            // 销毁按钮
            wechatLogin.destroy();
        });

        // 判断用户当前是否授权，没授权才会让用户授权
        wx.getUserInfo({
            success(res) {
                // 获取用户信息, 加载头像
                let user_info = res.userInfo;
                // console.log(user_info);
                self.showWXIcon(user_info, self);

                self.getDataFromWechatMiniProgram(self);
                let nick_name_node = cc.find('Canvas/background/nick_name');
                let nick_name = nick_name_node.getComponent(cc.Label);
                nick_name.string = 'GOAL:' + self.highest_score;
                // 销毁按钮
                wechatLogin.destroy();
            },
            fail() {
                console.log("获取用户信息失败！");
            }
        })
    },

    update (dt) {

    },

    /**
     *
     * 该函数实现点击垃圾桶实现分类和动画的效果，不同的垃圾桶通过传入的不同的CustomEventData参数来区分
     * @param event
     * @param CustomEventData
     */
    clickClassify: function (event, CustomEventData) {

        let card_node = cc.find('Canvas/background/card');  //  获取card节点
        let self = this;


        // 动作1:实现点击垃圾桶后，卡片card向左移动，直到消失在屏幕
        let move_2_left = cc.moveTo(0.5, -375,40);

        // 动作2:实现最后消除card节点和重新生成card节点并且完成计分
        let finish =cc.callFunc(function () {
            // 计分
            // 注意嵌套定义属性，这行代码改了半天
            let garbage_class = cc.find('Canvas/background/card/garbage').getComponent('garbage').random_garbage_class;
            cc.log('当前垃圾种类为：'+garbage_class)
            if(garbage_class == CustomEventData){
                cc.log('分类正确！');
                self.score++;
                self.time += self.setTime(true, self.score);
                self.continue_correct++;

                // 修改得分显示
                let score = cc.find('Canvas/background/score').getComponent(cc.Label);
                score.string = 'Score:' + self.score;
            }
            else{

                let grey_background = cc.find('Canvas/background/grey_background');
                grey_background.active = true;
                grey_background.setSiblingIndex(99);

                // 连续回答正确置零
                self.continue_correct = 0;

                // 显示提示
                let star_left_sprite = cc.find('Canvas/background/window/star_left')
                let star_center_sprite = cc.find('Canvas/background/window/star_center')
                let star_right_sprite = cc.find('Canvas/background/window/star_right')
                star_left_sprite.active = false;
                star_center_sprite.active = false;
                star_right_sprite.active = false;

                let window_node = cc.find('Canvas/background/window');
                window_node.setSiblingIndex(100);

                // 修改window内两个文本的内容
                let title = cc.find('Canvas/background/window/title');
                title.getComponent(cc.Label).string = '分类错误';
                title.color = new cc.color(250,128,114,0);

                let garbage_class = cc.find('Canvas/background/card/garbage').getComponent('garbage').random_garbage_class;
                let content = cc.find('Canvas/background/window/content');
                content.getComponent(cc.Label).string = '该垃圾为:' + garbage_class_name[garbage_class];
                content.color = new cc.color(255,160,122,0);

                let quit_wechat_label = cc.find('Canvas/background/window/quitwechat/Background/Label').getComponent(cc.Label);
                quit_wechat_label.string = '继续游戏';

                window_node.active = true;
                cc.director.pause();
            }
            let continue_correct =cc.find('Canvas/background/correct').getComponent(cc.Label);
            continue_correct.string = self.continue_correct + '连击';

            // 实现卡片的循环
            // remove card_node
            let background_node = cc.find('Canvas/background');
            background_node.removeChild(self.card_node);

            // add card_node
            self.card_node = cc.instantiate(self.card_prefab);
            background_node.addChild(self.card_node);


        });
        // let correct_node = cc.find('Canvas/background/correct');
        // correct_node.getComponent(cc.Label).string = self.continue_correct + '连击';
        // correct_node.size =(20, 20);


        let sequence_move = cc.sequence(move_2_left, finish);

        card_node.runAction(sequence_move)

        cc.log(CustomEventData)
    },

    clickResume: function (event, CustomEventData) {
        let grey_background = cc.find('Canvas/background/grey_background');
        grey_background.active = false;

        let star_left_sprite = cc.find('Canvas/background/window/star_left')
        let star_center_sprite = cc.find('Canvas/background/window/star_center')
        let star_right_sprite = cc.find('Canvas/background/window/star_right')
        star_left_sprite.active = true;
        star_center_sprite.active = true;
        star_right_sprite.active = true;
        let window_node = cc.find('Canvas/background/window');
        window_node.active =false;

        cc.director.resume();
        if(this.game_over){
            this.game_over = false;
            cc.director.loadScene('game');
        }
    },

    clickBackWechat: function (event, CustomEventData) {

        if(this.game_over){
            // TODO:退出当前小游戏,返回主程序

            // wx.navigateToMiniProgram({
            //     appId: 'wx0ee4145f91629f11',
            //     path: 'pages/index/index',
            //     extraData: {
            //         foo: 'bar'
            //     },
            //     envVersion: 'trial',
            //     success(res) {
            //         // 打开成功
            //     }
            // })
            wx.exitMiniProgram();

        }
        else{
            this.clickResume();
        }
    },

    clickShare: function (event, CustomEventData) {
        wx.shareAppMessage({
            title: "大家一起来分类！",
            imageUrl: 'https://www.lbiography.com/static/garbage/guard',
            success(res) {
                console.log(res);
            },
            fail (res){
                console.log(res);
            }
        })
    },

    // 更新最高分
    setMaxPoint: function(self) {
        const that = self;
        wx.request({
            url: 'https://www.lbiography.com/activity/update_environmental_protection_guard',
            method: 'POST',
            data: {
                openid: that.openid,
                point: that.score
            },
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            success: (res) => {
                console.log(res);
            },fail: (error) => {
                console.error('请求错误', error);
            }})
    },

    showWXIcon: function (user_info, self) {
        // 加载头像
        let icon_node = cc.find('Canvas/background/icon');
        let icon = icon_node.getComponent(cc.Sprite);
        cc.loader.load({url: user_info.avatarUrl, type: 'png'}, function (err, texture){
            icon.spriteFrame = new cc.SpriteFrame(texture);
        });

        // let nick_name_node = cc.find('Canvas/background/nick_name');
        // let nick_name = nick_name_node.getComponent(cc.Label);
        // nick_name.string = user_info.nickName + '的最高分是:' + self.highest_score;

        // adjust size
        icon_node.size = (60, 60);
    },

    /**
     * 从主程序中获取信息，并且设置最高分
     */
    getDataFromWechatMiniProgram: function (self, nick_name) {
        if('extraData' in wx.getLaunchOptionsSync().referrerInfo){
            console.log('来着主程序的信息:', wx.getLaunchOptionsSync().referrerInfo);
            self.openid = wx.getLaunchOptionsSync().referrerInfo.extraData.openid;
            self.highest_score = wx.getLaunchOptionsSync().referrerInfo.extraData.max_point;
        }
        else{
            console.log('没有从主程序进入小游戏');
        }
    },

    setTime: function (correct, current_score) {
        // 回答正确
        if(correct) {
            let time = Math.max(0, Math.floor(10 - current_score/5));
            return time;
        }
        // 回答错误，不设置惩罚
        else return 0;
    }

});
