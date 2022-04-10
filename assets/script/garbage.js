// const garbage_image_color = new cc.Class({
//     name: 'garbage_images_color',
//     properties: {
//         color: {
//             default: [],
//             type: [cc.SpriteFrame]
//         }
//     }
// });
//
// const garbage_image = new cc.Class({
//     name: 'garbage_images',
//     properties: {
//         images: {
//             default: [],
//             type: [garbage_image_color]
//         }
//     }
// });



// 垃圾图片定位url
const garbage_images_location = 'https://www.lbiography.com/static/garbage';   //服务器位置
const garbage_class_name = ['1_kitchen', '2_recycle', '3_harmful', '4_other'];  //文件名
const color_index = ['blue', 'green', 'red', 'yellow']; //颜色数组

// 记录每种垃圾的具体垃圾名字
const kitchen_garbage_name = ['1_1_leftfood', '1_2_bone', '1_4_leaves', '1_5_peel', '1_6_apple',
    '1_7_tea', '1_8_vegetableleaf', '1_9_fallenleaves', '1_10_eggshell', '1_11_cake', '1_12_fishbone'];
const recycle_garbage_name = ['2_1_leaflet', '2_2_powerbank', '2_3_bag', '2_4_plastictoy', '2_5_plasticbasin',
    '2_5_plasticblow', '2_6_hanger', '2_7_express', '2_8_newspaper', '2_9_plug', '2_10_oldbook', '2_11_oldclothes',
    '2_12_can', '2_13_journal', '2_14_pillow', '2_15_toys', '2_16_plastic', '2_17_shampoo', '2_18_milkcarton',
    '2_19_glass', '2_20_glasses', '2_21_shoes', '2_22_cuttingboard', '2_23_carton', '2_24_cruet', '2_25_winebottle',
    '2_26_cans', '2_27_pot', '2_28_oildrum', '2_29_drinkbottle'];
const harmful_garbage_name = ['3_1_battery', '3_2_thermometer', '3_3_bulb', '3_4_insecticide', '3_6_ointment',
    '3_7_drug', '3_8_herbicide'];
const other_garbage_name = ['4_1_disposablecutlery', '4_2_cosmetics', '4_3_tissue', '4_4_diaper', '4_6_ciggrette',
    '4_7_toothpick', '4_8_brokenplastic', '4_9_chopsticks', '4_10_dixiecup', '4_11_shell'];
const garbage_names = [kitchen_garbage_name, recycle_garbage_name, harmful_garbage_name, other_garbage_name]

// 记录每种垃圾有多少个
const garbage_numbers = [kitchen_garbage_name.length, recycle_garbage_name.length,
    harmful_garbage_name.length, other_garbage_name.length];


cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 随机生成垃圾，生成url
        this.random_garbage_class = Math.floor(Math.random()*4);
        this.random_garbage_number = Math.floor(Math.random()*garbage_numbers[this.random_garbage_class]);
        this.random_garbage_color = Math.floor(Math.random()*4);
        let garbage_url = garbage_images_location + '/' + garbage_class_name[this.random_garbage_class] +
            '/' + garbage_names[this.random_garbage_class][this.random_garbage_number] + '_'
            + color_index[this.random_garbage_color] + '.png?aa=aa.png';

        // cc.log('当前垃圾类别:' + this.random_garbage_class);
        // cc.log('当前垃圾序号' + this.random_garbage_number)
        // cc.log('当前垃圾颜色' +this.random_garbage_color)
        // cc.log('当前垃圾url:' + garbage_url)


        // 加载url
        let sprite = this.getComponent(cc.Sprite);
        cc.loader.load({url: garbage_url, type: 'png'}, function (err, texture){
            sprite.spriteFrame = new cc.SpriteFrame(texture)
        });
        let garbage_node = cc.find('Canvas/background/card/garbage');
        garbage_node.size = (120, 120);
        garbage_node.scale = (0.1, 0.1);
        // 校验目标结点的正确性
        // console.log(garbage_node);

        // 实现card进入屏幕的动画
        let card_node = cc.find('Canvas/background/card');  //  获取card节点
        let move_1_left = cc.moveTo(1, 0,40);
        card_node.runAction(move_1_left);
    },

    start () {

    },

    update (dt) {
        // this.interval_time += dt;
        // let garbage_class = Math.floor(this.interval_time / 0.2);
        // garbage_class = garbage_class % 4;
    },
});
