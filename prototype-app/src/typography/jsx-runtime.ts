import {jsx as reactJsx,jsxs as reactJsxs} from 'react/jsx-runtime';
import {typographicProps} from './russian.mjs';
export {Fragment} from 'react/jsx-runtime';
export type {JSX} from 'react/jsx-runtime';
export const jsx=(type:any,props:any,key?:any)=>reactJsx(type,typographicProps(type,props),key);
export const jsxs=(type:any,props:any,key?:any)=>reactJsxs(type,typographicProps(type,props),key);
