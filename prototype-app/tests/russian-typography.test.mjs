import {test} from 'node:test';
import assert from 'node:assert/strict';
import {russianText,russianChildren,typographicProps} from '../src/typography/russian.mjs';

test('short Russian words and particles remain attached on their proper side',()=>{
 assert.equal(russianText('В движении и на карте. Можно ли сбросить?'),'В\u00a0движении и\u00a0на\u00a0карте. Можно\u00a0ли сбросить?');
 assert.equal(russianText('Объект в «СеверТранс»\nНа карте'),'Объект в\u00a0«СеверТранс»\nНа\u00a0карте');
 assert.equal(russianText('К списку ТС'),'К\u00a0списку ТС');
 assert.equal(russianText('Выберите продукт или вариант. Как проверить?'),'Выберите продукт или\u00a0вариант. Как\u00a0проверить?');
});
test('compound units and numbers cannot be split at a slash or space',()=>{
 assert.equal(russianText('Максимальная скорость, км/ч'),'Максимальная скорость, км\u2060/\u2060ч');
 assert.equal(russianText('130 км/ч · 20 °C · 1 575 км · № 42'),'130\u00a0км\u2060/\u2060ч · 20\u00a0°C · 1\u00a0575\u00a0км · №\u00a042');
 assert.equal(russianText('4 машины в очереди'),'4 машины в\u00a0очереди');
 assert.equal(russianText('На 13 октября 2026 г. после обновления'),'На\u00a013\u00a0октября 2026\u00a0г. после\u00a0обновления');
});
test('formatting is idempotent and leaves addresses and explicit newlines intact',()=>{
 const input='На карте https://example.org/км/ч и support@example.ru\nА. И. Иванов — водитель';
 const result=russianText(input);
 assert.equal(russianText(result),result);
 assert.ok(result.includes('https://example.org/км/ч'));
 assert.ok(result.includes('support@example.ru\nА.\u00a0И.\u00a0Иванов\u00a0— водитель'));
});
test('render boundary joins primitive children without changing records, handlers or form values',()=>{
 assert.deepEqual(russianChildren([130,' км/ч']),['130\u00a0км\u2060/\u2060ч']);
 const record={label:'В движении'},handler=()=>{},props={children:record.label,value:record.label,onClick:handler};
 assert.equal(typographicProps('span',props).children,'В\u00a0движении');
 assert.equal(typographicProps('span',props).value,'В движении');
 assert.equal(typographicProps('span',props).onClick,handler);
 assert.equal(record.label,'В движении');
 for(const tag of ['input','textarea','option','pre','code'])assert.equal(typographicProps(tag,props),props);
 assert.equal(typographicProps('div',{...props,contentEditable:true}).children,'В движении');
});
