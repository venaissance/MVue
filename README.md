# MVue

基于 Vue2 原理实现的简易 MVue框架 ，功能包括数据响应式、模板编译、双向绑定，主要用于个人学习。

### 功能点展示

[预览链接](https://venaissance.github.io/MVue/final.html)

```html
  <body>
    <div id="app">
      <!-- 插值绑定 -->
      <p>{{name}}</p>
      <!-- 指令解析 -->
      <p m-text="name"></p>
      <p>{{number}}</p>
      <p>{{doubleAge}}</p>
      <!-- 双向绑定 -->
      <input type="text" m-model="name" />
      <button @click="changeName">预测一下</button>
      <!-- html内容解析 -->
      <div m-html="html"></div>
    </div>
    <script src="./compile.js"></script>
    <script src="./mvue.js"></script>
    <script>
      const app = new MVue({
        el: "#app", // 挂载点
        data: {
          name: "Kobe",
          number: 24,
          html: "<button>一个按钮</button>",
        },
        created() {
          console.log("开始");
          setTimeout(() => {
            this.name = "James";
            this.number = 23;
            console.log("结束");
          }, 1500);
        },
        methods: {
          changeName() {
            this.name = "湖人总冠军";
            this.number = 66666666;
          },
        },
      });
    </script>
  </body>
  ```
  
  
### 使用说明

`git clone` 后，Chrome 打开对应 html 文件即可。

- `begin.html` Vue2数据响应式原理

- `median.htm` 测试一下 MVue 的数据响应式功能

- `final.html` MVue 的完整实现展示

- `mvue.js` 实现数据响应式

- `compile.js` 实现 MVue 模板编译、插值文本、@方法、v-model 双向绑定


