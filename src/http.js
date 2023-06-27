const HTTP = {
  /**
   * 封装ajax请求
   * 使用new XMLHttpRequest 创建请求对象
   *
   * @param settings 请求参数(data参数需要和请求头Content-Type对应)
   *
   *  Content-Type                      |  data                                       |  描述
   * ------------------------------------------------------------------------------------------------------------------------------------
   *  application/x-www-form-urlencoded |  name=Amy&age=10 或 {name:'Amy',age:10}     | 用&分割的字符串 或 json对象
   *  application/json                  |  {name:'Amy',age:10}                        | json对象
   *  multipart/form-data               |  new FormData()                             | FormData对象,不要手动设置Content-Type
   *
   *  注意:请求参数如果包含日期类型需要服务端接口配置处理
   */
  ajax: (settings = {}) => {
    // 初始化请求参数
    let _s = Object.assign(
      {
        url: "", // string
        method: "GET", // string 'GET' 'POST' 'DELETE'
        dataType: "json", // string 期望的返回数据类型:'json' 'text' 'document' 等
        async: true, // boolean true:异步请求 false:同步请求 required
        data: null, // any 请求参数,data需要和请求头Content-Type对应
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }, // object 请求头
        timeout: 0, // string 超时时间:0表示不设置超时
        cache: false,
        beforeSend: (xhr) => {},
        success: (result, status, xhr) => {},
        error: (xhr, status, error) => {},
        complete: (xhr, status) => {},
      },
      settings,
    );
    // 参数验证
    if (!_s.url || !_s.method || !_s.dataType || !_s.async) {
      alert("参数有误");
      return false;
    }
    // 创建XMLHttpRequest请求对象
    let xhr = new XMLHttpRequest();
    // 请求开始回调函数
    xhr.addEventListener("loadstart", (e) => {
      _s.beforeSend(xhr);
    });
    // 请求成功回调函数
    xhr.addEventListener("load", (e) => {
      const status = xhr.status;
      if ((status >= 200 && status < 300) || status === 304) {
        let result;
        if (xhr.responseType === "text") {
          result = xhr.responseText;
        } else if (xhr.responseType === "document") {
          result = xhr.responseXML;
        } else {
          result = xhr.response;
        }
        // 注意:状态码200表示请求发送/接受成功,不表示业务处理成功
        _s.success(result, status, xhr);
      } else {
        _s.error(xhr, status, e);
      }
    });
    // 请求结束
    xhr.addEventListener("loadend", (e) => {
      _s.complete(xhr, xhr.status);
    });
    // 请求出错
    xhr.addEventListener("error", (e) => {
      _s.error(xhr, xhr.status, e);
    });
    // 请求超时
    xhr.addEventListener("timeout", (e) => {
      _s.error(xhr, 408, e);
    });
    //上传进度条
    /*
    xhr.upload.addEventListener('progress', e => {
      console.log('上传进度:', `${e.loaded}/${e.total}`);
    });
    */
    let useUrlParam = false;
    let sMethod = _s.method.toUpperCase();
    // 如果是"简单"请求,则把data参数组装在url上
    if (sMethod === "GET" || sMethod === "DELETE") {
      useUrlParam = true;
      _s.url += HTTP.getUrlParam(_s.url, _s.data);
    }
    // 初始化请求
    xhr.open(_s.method, _s.url, _s.async);
    // 设置期望的返回数据类型
    xhr.responseType = _s.dataType;
    // 设置请求头
    for (const key of Object.keys(_s.headers)) {
      xhr.setRequestHeader(key, _s.headers[key]);
    }
    // 设置超时时间
    if (_s.async && _s.timeout) {
      xhr.timeout = _s.timeout;
    }
    // 发送请求.如果是简单请求,请求参数应为null.否则,请求参数类型需要和请求头Content-Type对应
    xhr.send(useUrlParam ? null : HTTP.getQueryData(_s.data));
  },

  // 把参数data转为url查询参数
  getUrlParam: (url, data) => {
    if (!data) {
      return "";
    }
    let paramsStr = data instanceof Object ? HTTP.getQueryString(data) : data;
    return url.indexOf("?") !== -1 ? paramsStr : "?" + paramsStr;
  },

  // 获取ajax请求参数
  getQueryData: (data) => {
    if (!data) {
      return null;
    }
    if (typeof data === "string") {
      return data;
    }
    if (data instanceof FormData) {
      return data;
    }
    return HTTP.getQueryString(data);
  },

  // 把对象转为查询字符串
  getQueryString: (data) => {
    let paramsArr = [];
    if (data instanceof Object) {
      Object.keys(data).forEach((key) => {
        let val = data[key];
        // todo 参数Date类型需要根据后台api酌情处理
        if (val instanceof Date) {
          val = dateFormat(val, "yyyy-MM-dd hh:mm:ss");
        }
        paramsArr.push(encodeURIComponent(key) + "=" + encodeURIComponent(val));
      });
    }
    return paramsArr.join("&");
  },

  /**
   * 根据实际业务情况装饰 ajax 方法
   * 如:统一异常处理,添加http请求头,请求展示loading等
   * @param settings
   */
  request: (settings = {}) => {
    // 统一异常处理函数
    let errorHandle = (xhr, status) => {
      console.log("request error...");
      if (status === 401) {
        console.log("request 没有权限...");
      }
      if (status === 408) {
        console.log("request timeout");
      }
    };
    // 使用before拦截参数的 beforeSend 回调函数
    settings.beforeSend = (settings.beforeSend || function () {}).before((xhr) => {
      console.log("request show loading...");
    });
    // 保存参数success回调函数
    let successFn = settings.success;
    // 覆盖参数success回调函数
    settings.success = (result, status, xhr) => {
      // todo 根据后台接口api判断是否请求成功
      if (result && result instanceof Object && result.code !== 1) {
        errorHandle(xhr, status);
      } else {
        console.log("request success");
        successFn && successFn(result, status, xhr);
      }
    };
    // 拦截参数的 error
    settings.error = (settings.error || function () {}).before((result, status, xhr) => {
      errorHandle(xhr, status);
    });
    // 拦截参数的 complete
    settings.complete = (settings.complete || function () {}).after((xhr, status) => {
      console.log("request hide loading...");
    });
    // 请求添加权限头,然后调用HTTP.ajax方法
    HTTP.ajax.before(HTTP.addAuthorizationHeader)(settings);
  },

  // 添加权限请求头
  addAuthorizationHeader: (settings) => {
    settings.headers = settings.headers || {};
    const headerKey = "Authorization"; // todo 权限头名称
    // 判断是否已经存在权限header
    let hasAuthorization = Object.keys(settings.headers).some((key) => {
      return key === headerKey;
    });
    if (!hasAuthorization) {
      settings.headers[headerKey] = "test"; // todo 从缓存中获取headerKey的值
    }
  },

  get: (url, data, successCallback, dataType = "json") => {
    HTTP.request({
      url: url,
      method: "GET",
      dataType: dataType,
      data: data,
      success: successCallback,
    });
  },

  delete: (url, data, successCallback, dataType = "json") => {
    HTTP.request({
      url: url,
      method: "DELETE",
      dataType: dataType,
      data: data,
      success: successCallback,
    });
  },

  // 调用此方法,参数data应为查询字符串或普通对象
  post: (url, data, successCallback, dataType = "json") => {
    HTTP.request({
      url: url,
      method: "POST",
      dataType: dataType,
      data: data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      success: successCallback,
    });
  },

  // 调用此方法,参数data应为json字符串
  postBody: (url, data, successCallback, dataType = "json") => {
    HTTP.request({
      url: url,
      method: "POST",
      dataType: dataType,
      data: data,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      success: successCallback,
    });
  },
};

Function.prototype.before = function (beforeFn) {
  // eslint-disable-line
  let _self = this;
  return function () {
    beforeFn.apply(this, arguments);
    _self.apply(this, arguments);
  };
};

Function.prototype.after = function (afterFn) {
  // eslint-disable-line
  let _self = this;
  return function () {
    _self.apply(this, arguments);
    afterFn.apply(this, arguments);
  };
};

// 日期格式化
const dateFormat = (date, sFormat = "yyyy-MM-dd") => {
  if (!(date instanceof Date)) {
    return;
  }
  let time = {
    Year: 0,
    TYear: "0",
    Month: 0,
    TMonth: "0",
    Day: 0,
    TDay: "0",
    Hour: 0,
    THour: "0",
    hour: 0,
    Thour: "0",
    Minute: 0,
    TMinute: "0",
    Second: 0,
    TSecond: "0",
    Millisecond: 0,
  };
  time.Year = date.getFullYear();
  time.TYear = String(time.Year).substr(2);
  time.Month = date.getMonth() + 1;
  time.TMonth = time.Month < 10 ? "0" + time.Month : String(time.Month);
  time.Day = date.getDate();
  time.TDay = time.Day < 10 ? "0" + time.Day : String(time.Day);
  time.Hour = date.getHours();
  time.THour = time.Hour < 10 ? "0" + time.Hour : String(time.Hour);
  time.hour = time.Hour < 13 ? time.Hour : time.Hour - 12;
  time.Thour = time.hour < 10 ? "0" + time.hour : String(time.hour);
  time.Minute = date.getMinutes();
  time.TMinute = time.Minute < 10 ? "0" + time.Minute : String(time.Minute);
  time.Second = date.getSeconds();
  time.TSecond = time.Second < 10 ? "0" + time.Second : String(time.Second);
  time.Millisecond = date.getMilliseconds();

  return sFormat
    .replace(/yyyy/gi, String(time.Year))
    .replace(/yyy/gi, String(time.Year))
    .replace(/yy/gi, time.TYear)
    .replace(/y/gi, time.TYear)
    .replace(/MM/g, time.TMonth)
    .replace(/M/g, String(time.Month))
    .replace(/dd/gi, time.TDay)
    .replace(/d/gi, String(time.Day))
    .replace(/HH/g, time.THour)
    .replace(/H/g, String(time.Hour))
    .replace(/hh/g, time.Thour)
    .replace(/h/g, String(time.hour))
    .replace(/mm/g, time.TMinute)
    .replace(/m/g, String(time.Minute))
    .replace(/ss/gi, time.TSecond)
    .replace(/s/gi, String(time.Second))
    .replace(/fff/gi, String(time.Millisecond));
};

export default HTTP;
