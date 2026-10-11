const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../hello-theme-child-master/assets/jj-arcade/games/gb-mole-patrol.html'),'utf8');const script=html.match(/<script id="mole-patrol-core">([\s\S]*?)<\/script>/)[1];const sandbox={};vm.runInNewContext(script,sandbox);const Model=sandbox.MolePatrolCore.MolePatrolModel;
const model=new Model(()=>.5);const target=kind=>{model.slots[0]={id:++model.serial,kind,expires:model.elapsed+1,hit:false,reactionUntil:0,text:''};};
function advance(seconds){for(let i=0;i<Math.round(seconds*100);i++)model.step(.01);}
model.start();target('mole');assert.equal(model.tap(0).points,10);assert.equal(model.tap(0),null);assert.equal(model.taps,1);assert.equal(model.score,10);
for(let i=0;i<4;i++){target('mole');model.tap(0);}assert.equal(model.multiplier,2);assert.equal(model.score,60);
for(let i=0;i<5;i++){target('mole');model.tap(0);}assert.equal(model.multiplier,3);assert.equal(model.score,170);
target('gold');assert.equal(model.tap(0).points,30);assert.equal(model.streak,10);assert.equal(model.score,200);
target('turtle');assert.equal(model.tap(0).points,-10);assert.equal(model.streak,0);assert.equal(model.multiplier,1);assert.equal(model.score,190);assert.equal(model.accuracy,92);
model.score=3;target('turtle');model.tap(0);assert.equal(model.score,0);
model.slots.fill(null);model.streak=7;model.multiplier=2;model.tap(0);assert.equal(model.streak,0);assert.equal(model.score,0);
model.start();target('mole');model.streak=3;model.pause();advance(2);assert.equal(model.elapsed,0);assert.equal(model.slots[0].expires,1);assert.equal(model.tap(0),null);model.resume();advance(1.1);assert.equal(model.streak,0);
model.start();target('gold');model.streak=3;advance(1.1);assert.equal(model.streak,3);target('turtle');advance(1.1);assert.equal(model.streak,3);
model.start();model.elapsed=15;model.step(0);assert.equal(model.level,2);model.elapsed=30;model.step(0);assert.equal(model.level,3);model.elapsed=44.99;model.step(.02);assert.equal(model.phase,'over');assert(model.slots.every(x=>x===null));assert.equal(model.tap(0),null);model.start();assert.equal(model.level,1);assert.equal(model.score,0);assert.equal(model.accuracy,null);
for(let i=0;i<100;i++){model.slots.fill(null);model.spawn();const index=model.slots.findIndex(Boolean);assert(index>=0&&index<9);assert.equal(model.slots.filter(Boolean).length,1);assert.equal(model.slots[index].kind,'mole');}
model.start();for(let i=0;i<4500;i++){model.step(.01);assert(model.slots.filter(Boolean).length<=(model.level===1?1:2));}
console.log('PASS scoring, double-tap protection, streaks, gold, turtle, score floor, empty taps, accuracy, pause, expiry, level transitions, round end, reset and spawn caps.');
