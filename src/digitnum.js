/**
 * Created by 41547 on 2018/9/23.
 */

/*
 * 利用CSS+HTML实现的digit-number无法实现自适应大小，
 * 因为关键的三角形依赖于border-width，而border-width不支持百分比。
 * svg是另一种不错的实现方式！
 *
 * DigitNum的优势：
 * 基于canvas的动画，避免了页面无意义的重排和重绘；
 * 完全响应式图形，函数节流下的自动伸缩；
 * 更多的功能，布局可控、配色可控，支持%、:特殊符号；
 * 良好的扩展性，在某些场景下，可以将库当成一个绘图单元，来实现各种自定义开发；
 *
 * 注意！
 * 带有“：”的数字不能使用countup类型的动画，
 * 因为在计算步长的时候两次转换数据类型会丢失这些非数字符号
 */
;(function(global){
    //避免重复加载
    if(global.DigitNumber && global.DigitNumber.getInstance){
        return;
    }

    var digitNumber;

    //绘图类
    function NumberPainter(dom){
        var options,container,defaultOptions,number,mathNumber,suffix,decimalLength,
            width,height,topY,rightX,bottomY,leftX,
            canvas,context,pixel,
            countNumber,opacity,timer,step,
            digitLength,positionX,optionsChanged,
            numberWidth,borderRadius,outMargin,backHeight,backWidth,midGap,leftGap,topGap,bottomGap,paddingLeft,paddingTop,boneWidth
            ;
        var setOption,draw,initPainter,initCanvas,checkOptions,animateStart,
            drawTransitionFrame,drawCountupFrame,calcAnimate,digitToNumber,drawBack,drawShadow,
            drawNumber,numberToDigit,drawBone1,drawBone2,drawBone3,drawBone4,
            drawBone5,drawBone6,drawBone7,clear,initNumberLayout,drawPercent,
            drawColon,drawDot,resize,initCanvasSize,initSizeValue;

        //检查option是否已赋值
        checkOptions=function(){
            //工具方法，判断是否属于对象类型
            function isObject(obj){
                if(typeof obj === "object" || obj instanceof Object){
                    return true;
                }else{
                    return false;
                }

            }
            if(options===undefined || !isObject(options)){
                options=defaultOptions;
                return ;
            }
            //递归检查obj1是否有obj2的所有属性
            function recursive(obj1,obj2){
                var i;
                for(i in obj2){
                    if(isObject(obj2[i])){
                        if(obj1[i] && isObject(obj1[i])){
                            recursive(obj1[i],obj2[i]);
                        }else{
                            obj1[i]=obj2[i];
                        }
                    }else{
                        if(!obj1[i]){
                            obj1[i]=obj2[i];
                        }
                    }
                }
            }
            recursive(options,defaultOptions);
        };

        //根据父元素设置canvas的大小
        initCanvasSize=function(){
            canvas.width=container.clientWidth*pixel;
            canvas.height=container.clientHeight*pixel;
            canvas.style.width=container.clientWidth+"px";
            canvas.style.height=container.clientHeight+"px";
            canvas.style.position="absolute";
        };

        //初始化画布
        initCanvas=function(){
            canvas=container.realCanvas || document.createElement("canvas");
            initCanvasSize();
            container.realCanvas=canvas;
            container.appendChild(canvas);
            context=canvas.getContext("2d");
        };

        //初始化全局大小元素
        initSizeValue=function(){
            //value
            width=canvas.width*(1-options.layout.b-options.layout.d);
            height=canvas.height*(1-options.layout.a-options.layout.c);
            topY=canvas.height*options.layout.a;
            bottomY=canvas.height*(1-options.layout.c);
            leftX=canvas.width*options.layout.d;
            rightX=canvas.width*(1-options.layout.b);
        };

        //初始化单个数字布局
        initNumberLayout=function(){
            initSizeValue();
            boneWidth=0.14;
            borderRadius=0.1;
            outMargin=0.05;
            midGap=0.02;
            leftGap=0.02;
            topGap=0.02;
            bottomGap=0.01;
            paddingLeft=0.1;
            paddingTop=0.14;
            //具体值
            numberWidth=width/digitLength;
            if(numberWidth>height){
                borderRadius=Math.ceil(borderRadius*height);
                boneWidth*=height;
            }else{
                borderRadius=Math.ceil(borderRadius*numberWidth);
                boneWidth*=numberWidth;
            }
            outMargin*=numberWidth;
            midGap*=height;
            leftGap*=numberWidth;
            topGap*=height;
            bottomGap*=height;
            paddingLeft*=numberWidth;
            paddingTop*=height;
            backHeight=(height-midGap)/2;
            backWidth=numberWidth-outMargin*2;
        };

        //第一横
        drawBone1=function(){
            var x,y;
            context.beginPath();
            x=positionX+paddingLeft+leftGap;
            y=topY+paddingTop;
            context.moveTo(x,y);
            context.lineTo(x+boneWidth,y+boneWidth);
            x=positionX+backWidth-paddingLeft-leftGap;
            context.lineTo(x-boneWidth,y+boneWidth);
            context.lineTo(x,y);
            context.closePath();
            context.fill();
        };
        //第二横
        drawBone2=function(){
            var x,y,heightRate,widthRate;
            //第二横的高度缩小比例,2为正常和其他一样高
            heightRate=2.4;
            //第二横的宽度缩小比例，1为正常和其他一样宽
            widthRate=2.5;
            context.beginPath();
            x=positionX+paddingLeft+leftGap*widthRate;
            y=topY+backHeight+midGap/2;
            context.moveTo(x,y);
            context.lineTo(x+boneWidth/2,y-boneWidth/heightRate);
            x=positionX+backWidth-paddingLeft-leftGap*widthRate;
            context.lineTo(x-boneWidth/2,y-boneWidth/heightRate);
            context.lineTo(x,y);
            context.lineTo(x-boneWidth/2,y+boneWidth/heightRate);
            context.lineTo(positionX+paddingLeft+leftGap+leftGap+boneWidth/2,y+boneWidth/heightRate);
            context.closePath();
            context.fill();
        };
        //第三横
        drawBone3=function(){
            var x,y;
            context.beginPath();
            x=positionX+paddingLeft+leftGap;
            y=bottomY-paddingTop;
            context.moveTo(x,y);
            context.lineTo(x+boneWidth,y-boneWidth);
            x=positionX+backWidth-paddingLeft-leftGap;
            context.lineTo(x-boneWidth,y-boneWidth);
            context.lineTo(x,y);
            context.closePath();
            context.fill();
        };
        //左上竖
        drawBone4=function(){
            var x,y;
            context.beginPath();
            x=positionX+paddingLeft;
            y=topY+paddingTop+topGap;
            context.moveTo(x,y);
            context.lineTo(x+boneWidth,y+boneWidth);
            y=topY+backHeight-bottomGap;
            context.lineTo(x+boneWidth,y-boneWidth);
            context.lineTo(x,y);
            context.closePath();
            context.fill();
        };
        //右上竖
        drawBone5=function(){
            var x,y;
            context.beginPath();
            x=positionX+backWidth-paddingLeft;
            y=topY+paddingTop+topGap;
            context.moveTo(x,y);
            context.lineTo(x-boneWidth,y+boneWidth);
            y=topY+backHeight-bottomGap;
            context.lineTo(x-boneWidth,y-boneWidth);
            context.lineTo(x,y);
            context.closePath();
            context.fill();
        };
        //左下竖
        drawBone6=function(){
            var x,y;
            context.beginPath();
            x=positionX+paddingLeft;
            y=topY+backHeight+midGap+bottomGap;
            context.moveTo(x,y);
            context.lineTo(x+boneWidth,y+boneWidth);
            y=topY+backHeight+backHeight+midGap-paddingTop-topGap;
            context.lineTo(x+boneWidth,y-boneWidth);
            context.lineTo(x,y);
            context.closePath();
            context.fill();
        };
        //右下竖
        drawBone7=function(){
            var x,y;
            context.beginPath();
            x=positionX+backWidth-paddingLeft;
            y=topY+backHeight+midGap+bottomGap;
            context.moveTo(x,y);
            context.lineTo(x-boneWidth,y+boneWidth);
            y=topY+backHeight+backHeight+midGap-paddingTop-topGap;
            context.lineTo(x-boneWidth,y-boneWidth);
            context.lineTo(x,y);
            context.closePath();
            context.fill();
        };

        //%
        drawPercent=function(){
            var x,y,roundOffset,roundWidth,lineWidth,lineOffset;
            context.beginPath();
            roundOffset=boneWidth/1.8;
            roundWidth=boneWidth*1.8;
            lineWidth=boneWidth;
            lineOffset=boneWidth/4;
            //上点
            x=positionX+paddingLeft+roundOffset;
            y=topY+paddingTop+roundOffset;
            context.fillRect(x+roundOffset,y,roundWidth-roundOffset,roundOffset);
            context.fillRect(x+roundWidth-roundOffset,y+roundOffset,roundOffset,roundWidth-roundOffset);
            context.fillRect(x,y+roundWidth-roundOffset,roundWidth-roundOffset,roundOffset);
            context.fillRect(x,y,roundOffset,roundWidth-roundOffset);
            //下点
            x=positionX+backWidth-paddingLeft-roundWidth-roundOffset;
            y=topY+backHeight+backHeight+midGap-paddingTop-roundWidth-roundOffset;
            context.fillRect(x+roundOffset,y,roundWidth-roundOffset,roundOffset);
            context.fillRect(x+roundWidth-roundOffset,y+roundOffset,roundOffset,roundWidth-roundOffset);
            context.fillRect(x,y+roundWidth-roundOffset,roundWidth-roundOffset,roundOffset);
            context.fillRect(x,y,roundOffset,roundWidth-roundOffset);
            //上竖
            x=positionX+backWidth-paddingLeft-lineWidth/2;
            y=topY+paddingTop;
            context.moveTo(x-lineWidth,y);
            context.lineTo(x,y);
            x=positionX+backWidth/2-lineWidth/2;
            y=topY+backHeight+midGap/2-lineOffset/2;
            context.lineTo(x+lineWidth,y);
            context.lineTo(x,y);
            context.closePath();
            context.fill();
            //下竖
            x-=1.4*lineWidth*lineOffset/(backHeight+midGap/2-lineOffset/2-paddingTop);
            y=y+lineOffset;
            context.moveTo(x,y);
            context.lineTo(x+lineWidth,y);
            x=positionX+paddingLeft+lineWidth/2;
            y=topY+backHeight+backHeight+midGap-paddingTop;
            context.lineTo(x+lineWidth,y);
            context.lineTo(x,y);
            context.closePath();
            context.fill();
        };

        //:
        drawColon=function(){
            var x,y,rectWidth;
            context.beginPath();
            rectWidth=boneWidth*2;
            x=positionX+backWidth/2-rectWidth/2;
            y=topY+backHeight/2;
            context.fillRect(x,y,rectWidth,rectWidth);
            y=topY+backHeight+midGap+backHeight/2-rectWidth/2;
            context.fillRect(x,y,rectWidth,rectWidth);
        };

        //.
        drawDot=function(){
            var x,y,rectWidth;
            context.beginPath();
            rectWidth=boneWidth*2;
            x=positionX+backWidth/2-rectWidth/2;
            y=topY+backHeight+midGap+backHeight/2-rectWidth/2;
            context.fillRect(x,y,rectWidth,rectWidth);
        };

        //绘制背景上下两块
        //关于arcTo方法，网上所有文档都是错误的。x1,x2实际上是圆心对角线的点坐标
        drawBack=function(){
            var x,y;
            //上半
            context.beginPath();
            context.fillStyle=options.color.background;
            context.moveTo(positionX+borderRadius,topY);
            x=positionX+backWidth;
            y=topY+backHeight;
            context.arcTo(x,topY,x,y,borderRadius);
            context.lineTo(x,y);
            context.lineTo(positionX,y);
            context.arcTo(positionX,topY,positionX+borderRadius,topY,borderRadius);
            context.closePath();
            context.fill();
            //下半
            context.beginPath();
            y=topY+backHeight+midGap;
            context.moveTo(positionX,y);
            context.lineTo(x,y);
            y+=backHeight;
            context.arcTo(x,y,x-borderRadius,y,borderRadius);
            context.arcTo(positionX,y,positionX,y-borderRadius,borderRadius);
            context.closePath();
            context.fill();
        };

        //绘制数字阴影
        drawShadow=function(){
            context.fillStyle=options.color.shadow;
            drawBone1();
            drawBone2();
            drawBone3();
            drawBone4();
            drawBone5();
            drawBone6();
            drawBone7();
        };

        //绘制数字
        drawNumber=function(nu){
            if(nu===undefined){
                return ;
            }
            context.fillStyle=options.color.number;
            if(nu==="%"){
                drawPercent();
                return ;
            }else if(nu===":"){
                drawColon();
                return ;
            }else if(nu==="."){
                drawDot();
                return ;
            }
            nu=parseInt(nu);
            if(nu===0){
                drawBone1();
                drawBone3();
                drawBone4();
                drawBone5();
                drawBone6();
                drawBone7();
            }else if(nu===1){
                drawBone5();
                drawBone7();
            }else if(nu===2){
                drawBone1();
                drawBone2();
                drawBone3();
                drawBone5();
                drawBone6();
            }else if(nu===3){
                drawBone1();
                drawBone2();
                drawBone3();
                drawBone5();
                drawBone7();
            }else if(nu===4){
                drawBone2();
                drawBone4();
                drawBone5();
                drawBone7();
            }else if(nu===5){
                drawBone1();
                drawBone2();
                drawBone3();
                drawBone4();
                drawBone7();
            }else if(nu===6){
                drawBone1();
                drawBone2();
                drawBone3();
                drawBone4();
                drawBone6();
                drawBone7();
            }else if(nu===7){
                drawBone1();
                drawBone5();
                drawBone7();
            }else if(nu===8){
                drawBone1();
                drawBone2();
                drawBone3();
                drawBone4();
                drawBone5();
                drawBone6();
                drawBone7();
            }else if(nu===9){
                drawBone1();
                drawBone2();
                drawBone3();
                drawBone4();
                drawBone5();
                drawBone7();
            }
        };

        //透明度渐变循环器
        drawTransitionFrame=function(op){
            var i,l;
            context.clearRect(0,0,canvas.width,canvas.height);
            for(i=0,l=number.length;i<l;i++){
                positionX=leftX+i*numberWidth+outMargin;
                context.globalAlpha=1;
                drawBack();
                drawShadow();
                context.globalAlpha=op;
                drawNumber(number[i]);
            }
        };

        //滚动数字循环器
        drawCountupFrame=function(nu){
            var i,l;
            context.clearRect(0,0,canvas.width,canvas.height);
            for(i=0,l=nu.length;i<l;i++){
                positionX=leftX+i*numberWidth+outMargin;
                drawBack();
                drawShadow();
                drawNumber(nu[i]);
            }
        };

        //计算步长
        calcAnimate=function(){
            if(options.animate.type==="countup"){
                if(decimalLength){
                    step=(mathNumber/(options.animate.time/options.animate.tick));
                }else{
                    step=Math.ceil(mathNumber/(options.animate.time/options.animate.tick));
                }
            }else if(options.animate.type==="transition"){
                step=1/(options.animate.time/options.animate.tick);
            }
        };

        //数字转数组
        numberToDigit=function(nu){
            var digit,i,l;
            digit=new Array(digitLength);
            //小数
            if(decimalLength){
                nu=nu.toFixed(decimalLength);
            }else{
                nu=nu.toString();
            }
            //最后一位是特殊符号
            if(suffix){
                nu+=suffix;
            }
            for(i=nu.length-1,l=digitLength-1;i>=0 && l>=0;i--,l--){
                digit[l]=nu[i];
            }
            return digit;
        };

        //数组转数字
        digitToNumber=function(di){
            var currNumber,i,l,dotNumber;
            if(decimalLength){
                //小数，借助js方法，如果数组中有不识别的字符，将会导致丢失位数
                dotNumber="";
                for(i=0,l=di.length;i<l;i++){
                    dotNumber+=di[i];
                }
                currNumber=parseFloat(dotNumber);
            }else{
                //数组中不识别的字符将会作为数字的一位，不会丢失位数
                currNumber=0;
                for(i=0,l=di.length-1;i<=l;i++){
                    if(!isNaN(parseInt(di[l-i]))){
                        currNumber+=di[l-i]*(Math.pow(10,i));
                    }
                }
                //最后一位是特殊符号
                if(suffix){
                    currNumber/=10;
                }
            }
            return currNumber;
        };

        //开始动画
        animateStart=function(){
            initNumberLayout();
            calcAnimate();
            //var start=new Date().getTime();
            if(options.animate.type==="countup"){
                countNumber=0;
                drawCountupFrame(numberToDigit(countNumber));
                timer=setTimeout(function loop(){
                    if(countNumber<mathNumber){
                        drawCountupFrame(numberToDigit(countNumber));
                        countNumber+=step;
                        timer=setTimeout(loop,options.animate.tick);
                    }else{
                        //console.log("countup",new Date().getTime()-start);
                        drawCountupFrame(number);
                    }
                },options.animate.tick);
            }else if(options.animate.type==="transition"){
                opacity=0;
                drawTransitionFrame(opacity);
                timer=setTimeout(function loop(){
                    if(opacity<1){
                        drawTransitionFrame(opacity);
                        opacity+=step;
                        timer=setTimeout(loop,options.animate.tick);
                    }else{
                        //console.log("transition",new Date().getTime()-start);
                        drawTransitionFrame(1);
                    }
                },options.animate.tick);
            }else{
                drawTransitionFrame(1);
            }
        };

        //初始化配置
        initPainter=function(){
            container=dom;
            pixel=global.devicePixelRatio;
            checkOptions();
            initCanvas();
        };

        //设置属性
        setOption=function(op){
            optionsChanged=true;
            options=op;
        };

        //开始绘制
        draw=function(nu){
            digitLength=nu.length;
            number=nu;
            //判断小数点存在&&不在最后一位
            if(number.indexOf(".")>=0){
                decimalLength=number.length-1-number.indexOf(".");
            }else{
                decimalLength=undefined;
            }
            //判断%在最后一位
            if(number[number.length-1]==="%"){
                suffix="%";
                decimalLength--;
            }else{
                suffix=undefined;
            }
            mathNumber=digitToNumber(nu);
            if(optionsChanged){
                checkOptions();
            }
            animateStart();
        };

        //清除画布内容
        clear=function(){
        	number=undefined;
            context.clearRect(0,0,canvas.width,canvas.height);
        };

        //界面伸缩，重绘
        resize=function(){
        	if(number!==undefined){
				clearTimeout(timer);
	            initCanvasSize();
	            initNumberLayout();
	            drawTransitionFrame(1);
        	}
        };

        //默认配置
        defaultOptions={
            //绘图区与边界的间距，上右下左，百分比
            layout:{
                a:0.1,
                b:0.02,
                c:0.1,
                d:0.02
            },
            //颜色控制
            color:{
                //上下两个半形状区域的背景颜色
                background:"#094a99",
                //当数字暗淡时显示的阴影颜色
                shadow:"#053470",
                //数字的颜色
                number:"#09e852"
            },
            //动画控制
            animate:{
                //动画总时长
                time:800,
                //动画帧间隔
                tick:16,
                //动画模式countup(滚动数字)|transition(透明度渐变)
                type:""
            }
        };
        this.setOption=setOption;
        this.draw=draw;
        this.clear=clear;
        this.resize=resize;
        initPainter();
    }

    //挂载在window下的全局变量
    digitNumber=(function(){
        var instanceStorage,timer,delay,throttle;
        instanceStorage=[];
        timer=undefined;
        delay=50;

        //函数节流
        throttle=function(method){
            if(timer!==undefined){
                return ;
            }
            method();
            timer=setTimeout(function(){
                timer=undefined;
            },delay);
        };

        //监听页面resize
        global.addEventListener("resize",function(e){
            throttle(function(){
                var i,l;
                for(i=0,l=instanceStorage.length;i<l;i++){
                    instanceStorage[i].resize();
                }
            });
        },false);

        return {
            //工厂获取一个绘图器实例
            getInstance:function(dom){
                var instance;
                instance=new NumberPainter(dom);
                instanceStorage.push(instance);
                return instance;
            }
        };
    })();

    global.DigitNumber=digitNumber;
})(window);