# digitnumber说明文档
一个像素数字JavaScript插件。<br/>
A JavaScript tool to help you easily draw digit-number in webpage,which rely on canvas.

## 源文件说明
digitnum.js----插件源代码<br/>
example.html----示例代码<br/>
readme.txt----说明文档<br/>
design.png----设计图，对源码中的控制变量进行了说明

## 第一个示例
插件的语法几乎完全仿造ECharts，最简单的调用只需要执行下面两行js代码：
```
var painter=window.DigitNumber.getInstance(document.getElementById("digit-number"));
painter.draw([2,4]);
```

## 使用注意
1.插件基于html5canvas开发，因此浏览器兼容性为IE9及以上；<br/>
2.插件在window下挂DigitNumber属性，如果出现命名冲突，插件加载将会失败；<br/>
3.插件使用DOM3事件方法```addEventListener```监听了页面拉伸（```resize```），外层在加载插件之后不要使用DOM1事件去监听```window.onresize```，如果使用了，将会导致插件的方法被覆盖、无效；<br/>
4.DigitNumber仅提供getInstance一个方法，该方法传入一个==具有高度值的dom元素==，返回一个绘图器实例painter；<br/>
5.painter实例提供四个方法：```setOption、draw、clear、resize```；<br/>

>painter实例API说明<br/>
>**setOption**<br/>
>*该方法传入一个options对象，来自定义绘图器的样式。全部可配的参数共有10项，在digitnum.js中搜索```defaultOptions```即可看到这些配置项；*<br/>
>**draw**<br/>
>*该方法传入一个数组对象，进行绘制。例如一个数字24，传入时就应该是[2,4]。除了数字意外，插件还支持"%",":","."三种特殊符号，具体使用方式可见example.html；<br/>
>**clear**<br/>
>*调用该方法将清除绘图器绘制的所有内容。但是不会将canvas元素销毁，不会将绘图器实例销毁；*<br/>
>**resize**<br/>
>*该方法可以手动命令绘图器重新根据外层元素的长宽计算图形坐标值。插件本身已经监听了```window.resize```方法，在页面拉伸时都会重绘。之所以再对外提供这个方法，是为了支持某些页面没有拉伸，而拉伸内部元素的场景；*

## 插件的优势
1.利用CSS+HTML实现的digit-number无法实现自适应大小，因为关键的三角形依赖于border-width，而border-width不支持百分比。而插件实现了完全的响应式布局；<br/>
2.基于canvas的图形绘制，避免了浏览器无意义的重排和重绘；<br/>
3.支持特殊符号“%”、“：”，以及小数形式；