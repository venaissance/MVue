// 用法：new Compile(el, vm)
class Compiler {
  constructor(el, vm) {
    // 需要遍历的宿主节点，#app
    this.$el = document.querySelector(el);

    this.$vm = vm;

    // 编译
    if (this.$el) {
      // 转换#app内部的内容为片段Fragment
      this.$fragment = this.node2Fragment(this.$el);

      // 执行编译
      this.compile(this.$fragment);

      // 将编译完的HTML结果追加到$el
      this.$el.appendChild(this.$fragment);
    }
  }

  // 将宿主元素中的代码片段拿出来遍历，高效
  node2Fragment(el) {
    const frag = document.createDocumentFragment();

    // 将el中所有子元素搬家到frag中
    let child;
    while ((child = el.firstChild)) {
      frag.appendChild(child); // appendChild是个移动操作，会改变原对象
    }
    return frag;
  }

  // 编译
  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach((node) => {
      // 类型判断
      if (this.isElement(node)) {
        // 元素
        // console.log("编译元素", node.nodeName);
        // 查找m-，@，:
        const nodeAttrs = node.attributes;

        Array.from(nodeAttrs).forEach((attr) => {
          const attrName = attr.name; // 属性名 m-model, m-text, m-html...
          const exp = attr.value; // 属性值 name, html...

          if (this.isDirective(attrName)) {
            // m-text
            const dir = attrName.substring(2); // text, html...
            // 执行指令
            this[dir] && this[dir](node, this.$vm, exp);
          }
          if (this.isEvent(attrName)) {
            // @click
            const dir = attrName.substring(1);
            this.eventHandler(node, this.$vm, exp, dir);
          }
        });
      } else if (this.isInterpolation(node)) {
        // 插值文本
        // console.log("编译插值文本", node.textContent);
        this.compileText(node);
      }

      // 递归子节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }

  compileText(node) {
    // console.log(RegExp.$1); // 得到正则匹配的第一个分组()里的内容，就是{{}}里的内容
    // node.textContent = this.$vm.$data[RegExp.$1]; // 插值变量替换成真实data对应属性的值
    this.update(node, this.$vm, RegExp.$1, "text");
  }

  /**
   * 响应式更新
   * @param {*} node 更新节点
   * @param {*} vm vue实例
   * @param {*} exp 表达式
   * @param {*} dir 指令
   * @memberof Compiler
   */
  update(node, vm, exp, dir) {
    const updaterFn = this[dir + "Updater"];
    // 将vue模板语法转化成数据
    updaterFn && updaterFn(node, vm[exp]);
    // 数据监听，数据更新的时候触发update方法改变UI
    new Watcher(vm, exp, function (value) {
      // 这里的exp其实就是响应式的数据，比如data里面的name
      updaterFn && updaterFn(node, value);
    });
  }

  text(node, vm, exp) {
    this.update(node, vm, exp, "text");
  }

  // 双向绑定v-model(:update:input)
  model(node, vm, exp) {
    // input的value更新到UI
    this.update(node, vm, exp, "model");

    // UI更新改变数据
    node.addEventListener("input", (e) => {
      vm[exp] = e.target.value;
    });
  }

  modelUpdater(node, value) {
    node.value = value;
  }

  textUpdater(node, value) {
    node.textContent = value; // 插值变量替换成真实data对应属性的值
  }

  html(node, vm, exp) {
    this.update(node, vm, exp, "html");
  }

  htmlUpdater(node, value) {
    node.innerHTML = value;
  }

  // 事件处理器
  eventHandler(node, vm, exp, dir) {
    const fn = vm.$options.methods && vm.$options.methods[exp];
    if (dir && fn) {
      node.addEventListener(dir, fn.bind(vm));
    }
  }

  isDirective(attr) {
    return attr.indexOf("m-") === 0;
  }

  isEvent(attr) {
    return attr.indexOf("@") === 0;
  }

  isElement(node) {
    return node.nodeType === 1;
  }

  // 插值文本
  isInterpolation(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
}
