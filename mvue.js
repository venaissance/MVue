class MVue {
  constructor(options) {
    this.$options = options;

    // 数据响应式
    // new MVue({data: {...}})
    this.$data = options.data;
    this.observe(this.$data);

    // 模拟watcher的创建
    // new Watcher(); // 激活Dep.target
    // this.$data.name;
    // this.$data.foo.bar;

    new Compiler(options.el, this);

    // created执行
    if (options.created) {
      options.created.call(this); // 绑定好this
    }
  }

  observe(obj) {
    if (!obj || typeof obj !== "object") {
      return;
    }

    // 遍历该对象
    Object.keys(obj).forEach((key) => {
      this.defineReactive(obj, key, obj[key]);
      // 代理data中的属性到vue的实例上，可以用vm.XXX, this.XXX获取data
      this.proxyData(key);
    });
  }

  // 数据响应化
  defineReactive(obj, key, val) {
    this.observe(val); // 递归解决数据嵌套

    const dep = new Dep();

    Object.defineProperty(obj, key, {
      get() {
        Dep.target && dep.addDep(Dep.target); // 如果Dep.target被激活，则收集依赖
        return val;
      },
      set(newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal;
        // console.log(`${key} 属性更新了：${val}`);
        dep.notify();
      },
    });
  }

  // 代理
  proxyData(key) {
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newVal) {
        this.$data[key] = newVal; // 同样会触发defineReactive中的setter，通知更新
      },
    });
  }
}

// Dep: 依赖收集器，用来管理watcher
class Dep {
  constructor() {
    // 存放依赖集合(一个data属性对应一个watcher)
    this.deps = [];
  }

  addDep(dep) {
    this.deps.push(dep);
  }

  notify() {
    this.deps.forEach((dep) => dep.update());
  }
}

class Watcher {
  /**
   * Watcher监听器，每个Dep中可能有多个watcher，因为data属性在页面中可能会出现多次
   * @param {*} vm vue实例
   * @param {*} key data的属性（数据）
   * @param {*} cb 回调
   */
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;

    // 将当前watcher的实例指定到Dep的静态属性target
    Dep.target = this;
    this.vm[this.key]; // 触发getter，添加依赖（很关键）
    Dep.target = null;
  }

  update() {
    console.log("属性更新了");
    this.cb.call(this.vm, this.vm[this.key]);
  }
}
