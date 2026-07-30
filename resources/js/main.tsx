import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
const token=document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
const nativeFetch=window.fetch.bind(window);
window.fetch=(input,init={})=>{const url=typeof input==="string"?input:input instanceof URL?input.href:input.url;if(token&&url.startsWith("/")){const headers=new Headers(init.headers);headers.set("X-CSRF-TOKEN",token);headers.set("X-Requested-With","XMLHttpRequest");init={...init,headers};}return nativeFetch(input,init);};
createRoot(document.getElementById("app")!).render(<React.StrictMode><App/></React.StrictMode>);
