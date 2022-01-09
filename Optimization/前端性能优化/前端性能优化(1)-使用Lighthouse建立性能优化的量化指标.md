# 前端性能优化-使用Lighthouse建立性能优化的量化指标

为什么要进行web性能优化？

<b>Amazon发现每100ms延迟导致1%的销量损失</b>，所以前端性能优化关乎到用户的留存，网站的转换率，用户体验和网站的传播，甚至影响搜索排名遭到用户投诉，当然也会影响开发的效率。

我们要进行性能优化，那么至少优化到什么程度才算合格的呢？这时候就需要一个<b>可量化的指标</b>，下面介绍可量化的性能指标测试工具Lighthouse。

## Lighthouse快速开始

Lighthouse是一个网站整体质量评估开源的自动化工具，用于改进网络应用的质量。

Lighthouse使用起来特别简单：为 Lighthouse 提供一个要审查的网址，它将针对此页面运行一连串的测试，然后生成一个有关页面性能的报告，并且会给出针对性的优化建议。

运行 Lighthouse 的方式有两种: 作为 Chrome 扩展程序运行，或作为npm命令行工具运行。

#### Chrome 扩展程序

下载Chrome最新版本，最新版自带Lighthouse，或者安装 [Lighthouse Chrome 扩展程序](https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk)

打开Chrome的审查工具，在Lighthouse栏目下会有Generate report 按钮，点击该按钮，就可以自动生成测试报告：

![Lighthouse Chrome](https://user-images.githubusercontent.com/20060839/148499033-a390d9cb-4005-41ba-ae83-37d328b5c5e2.png)


#### 命令行工具

npm安装：

```bash
npm install -g lighthouse
```

对上线的网站进行性能测试：

```bash
lighthouse https://www.example.com --view
```

加上了--view参数会自动打开浏览器预览测试报告，最后会把测试报告生成一个html文件，html文件路径在lighthouse运行后输出命令的倒数第二行：

```js
LH:Printer html output written to C:\Users\Administrator\m.douyu.com_2022-01-06_22-36-37.report.html +68ms
LH:ChromeLauncher Killing Chrome instance 2176 +27ms
```

关于使用Chrome扩展程序还是命令行工具进行lighthouse测试，个人建议使用命令行工具方式进行测试，因为Chrome扩展程序测试结果可能受到浏览器缓存影响，而命令行测试则不会有缓存，并且npm装lighthouse是最新版本的。

## 测试报告解读

生成的测试报告：

![report01](https://user-images.githubusercontent.com/20060839/148400323-28e8a8fc-e3d3-43db-9d29-afd35f166e51.png)

生成的测试报告会对网站进行性能评分，主要有下面几个性能指标：

* First Contentful Paint：第一次有意义内容绘制的时间

* Speed Index：速度指数

* Largest Contentful Paint：可见资源最大内容绘制的时间

* Time to Interactive：用户可以和网站交互的时间

* Total Blocking Time：总阻塞时间

* Cumulative Layout Shift：累积布局偏移

#### 1.First Contentful Paint (FCP)

首次内容绘制(FCP)，是用户从开始访问页面到第一次呈现内容绘制的时间，该指标衡量了从页面开始加载到页面内容的任何部分呈现在屏幕上的时间。

来看看lighthouse里面记录用户开始访问到页面出来的过程截图：

![report02](https://user-images.githubusercontent.com/20060839/148404241-a4e22a40-f94a-40cc-a3d0-6a8fb32d36ff.png)

在上面图中可以看到，FCP发生在第4帧中，出现了骨架屏，白屏在第1/2/3帧中，所以这个网站对白屏控制的比较好。如果首页不是<b>渐进式加载</b>，而是一次性加载所有，资源请求时间过长，白屏时间也就会过长。

#### 2.Speed Index

速度指数，是Lighthouse报告中性能部分跟踪的六个指标之一。每项指标都能反映出页面加载速度的某些方面。

那么它是如何检测的呢？

> 速度指数衡量的是内容在页面加载过程中的视觉显示速度。Lighthouse首先会在浏览器中捕获一段页面加载的视频，并计算出各帧之间的视觉进度。然后，Lighthouse使用Speedline Node.js模块来生成速度指数得分。

那么我们有机会提升它的性能吗？

利用Lighthouse报告提供的优化建议：机会"Opportunities"和诊断"Diagnostics"，来找到潜在的优化点。

例如，下面的Lighthouse报告中的 "Opportunities"截图显示，优化适当大小的图像大小和消除渲染阻塞资源将带来很大的加载速度提升。

![report03](https://user-images.githubusercontent.com/20060839/148481442-7be346e3-a66c-49ac-8e4b-597db5a8e45a.png)

#### 3.Largest Contentful Paint (LCP)

最大内容绘制(LCP)，指标报告了在视口中可见的最大图像或文本块的渲染时间，相对于页面首次开始加载的时间。

#### 4.Total Blocking Time

总阻塞时间，测量了主线程被阻塞的时间长到足以阻止输入响应的总时间，它可以量化主线程的阻塞情况。js会阻塞渲染，优化该指标可以将不必要的js文件延迟加载。

最后，Lighthouse的介绍也到了这里，性能优化是一个长期工作，需要我们持续的投入和长期的积累...

## Performance API 获取页面性能

我们想要获取用户具体的页面性能，进行上传统计或者验证我们的优化结果时，有没有具体度量的方法呢？浏览器里面的window.performance这个API给我们提供了这样一个途径。

比如我们想要查询用户和网站可以交互的时间，就可以在load事件里使用下面方式进行比较：

```js
window.addEventListener('load', (event) => {
  // Time to Interactive
  let timing = performance.getEntriesByType('navigation')[0];
  let diff = timing.domInteractive - timing.fetchStart;
  console.log("TTI: " + diff);
})
```
更多API可查看官方文档。

参考链接(Tanks):
[如何使用Lighthouse性能检测工具](https://juejin.cn/post/6950855971379871757)
[使用 Performance API 获取页面性能](https://juejin.cn/post/6973567030528065573)
[前端性能优化指标 + 检测工具](https://juejin.cn/post/6974565176427151397#heading-0)
[web性能优化（Lighthouse和performance）：从实际项目入手，如何监测性能问题、如何解决](https://juejin.cn/post/6965744691979485197)