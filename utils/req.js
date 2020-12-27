// import { extend } from 'umi-request';
import axios from "axios";
import { notification } from "antd";
// import router from "umi/router";
import { destroyCookie } from 'nookies';
// Import Config
const config = require("../config/envConfig");

const codeMessage = {
  200: "The server successfully returned the requested data. ",
  201: " New or modified data is successful. ",
  202: " A request has entered the background queue (asynchronous task). ",
  204: " Delete data successfully. ",
  400: " The request was sent with an error, and the server did not perform operations to create or modify data. ",
  401: "The user does not have permission (invalid token or username, password is incorrect). ",
  403: " User is authorized, but access is forbidden. ",
  404: " The request was made for a record that does not exist and the server did not operate. ",
  406: " The format of the request is not available. ",
  410: "The requested resource was permanently deleted and will not be obtained again. ",
  422: " A validation error occurred while creating an object. ",
  500: "The server has an error, please check the server. ",
  502: " Gateway error. ",
  503: "The service is unavailable, the server is temporarily overloaded or maintained. ",
  504: "The gateway timed out. ",
  'ECONNREFUSED':"Error: connect ECONNREFUSED"
};

const openNotification = (errCode,url) => {
  // console.log("$$$$$$$$$$$$$$$$$$$$$$$",errCode);
  if(typeof localStorage !== "undefined"){
    notification.info({
      message: `Error : ${errCode}`,
      description: codeMessage[errCode] + "("+url+")",
      placement:'topRight',
      duration:0
    });

    switch(errCode){
      case 401:
        // helper.logout();
        if (localStorage.hasOwnProperty("token")) {
          localStorage.removeItem("token");
          destroyCookie(null, "token", { path: '/' })
      }
      if (localStorage.hasOwnProperty("me")) {
          localStorage.removeItem("me");
      }
      if (localStorage.hasOwnProperty("loginPreference")) {
          localStorage.removeItem("loginPreference");
      }


        // setTimeout(() => {
        //   window.location.href = "/auth/login";
        // }, 4000);
        break;
      case 402:
        break;
    }

  }else{
    throw "Error in response "+errCode + " : " + codeMessage[errCode] + "("+url+")";
  }

};

/**
 * Default parameters when configuring request request
 */
let url = config.api;

/**
 *
 * @param {string} link   API link
 * @param {object} params API peramitter
 */
const request = (link, params, noPrefix = null, header = null) => {
  // console.log("req----", link, params,header);
  // console.log("url----", url);
  let headers = {
    "Content-Type": "application/json,text/plain, */*; charset=utf-8",
    // Authorization: "Bearer ",
  };


  //console.log("req ========= mCache",mCache);
  if (typeof mCache !== "undefined" && mCache.size()) {
    let token = mCache.get("jwtoken");
    if (token) {
      //console.log("====================token applied from server mem cache===========================")
      headers.Authorization = token;
    }
  } else if (typeof localStorage !== "undefined" && localStorage.getItem("token")) {
    //console.log("======================token applied from localstorage=============",localStorage.getItem("token"));
    headers.Authorization = localStorage.getItem("token")
  } else {
    //console.log("======================empty token =============");
    headers.Authorization = "";
  }

  const ax = axios.create({
    baseURL: url,
    headers: headers
  });

  // console.log("axios----", ax);


  let confiq = {
    method: (params && params.method) || "GET",
    url: link,
    data: (params && params.data) || ""
  };

  // console.log("=========URL========", url);
  // console.log("=========confiq========", confiq);

  if (header) confiq.headers = header;

  return ax(confiq)
    .then(res => {
      // console.log("api response", {
      //   // data: res.data,
      //   pagination: {
      //     total: Number(res.headers.total),
      //     pageSize: Number(res.headers.limit)
      //   }
      // });
      //console.log("RIGHT")
      return {
        data: res.data,
        pagination: {
          total: Number(res.headers.total),
          pageSize: Number(res.headers.limit)
        }
      };
    })
    .catch(error => {
      // Error 😨
      if (error.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        // console.log("error.response=====");
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        // console.log("req error ===========response", error.response);

        //check this code is executing from browser end
        if(typeof localStorage !== "undefined"){
          openNotification(error.response.status,error.config.url);
        }
        // throw error.code + ":" + error.errno;
        // throw "Error in response "+error.response.status + ":" + error.config.url;
      } else if (error.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        // console.log("error.request=========",error.request);
        // console.log("req error ===========errno:", error.errno);
        // console.log("req error ===========code:", error.code);
        // console.log("req error ===========url:", error.config.url);
        // console.log("req error ===========headers:", error.config.headers);
        // console.log("req error =========== error.config.baseURL/error.config.url", error.config.baseURL,error.config.url);
        //check this code is executing from browser end
        if(typeof localStorage !== "undefined"){
          openNotification(error.code,error.config.url)
        }
        // throw "Error in request "+error.errno + ":" + error.config.url;
      } else {
        // Something happened in setting up the request and triggered an Error
        // console.log('Error==========', error.message);
        if(typeof localStorage !== "undefined"){
          openNotification(error.code,error.config.url)
        }
        // console.log('Error==========', error);
        // throw error.message;

      }
      return false;
    });
};

axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  // Do something with response error
  return Promise.reject(error);
});

export default request;


