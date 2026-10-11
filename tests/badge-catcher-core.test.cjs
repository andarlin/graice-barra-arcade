const {readFileSync}=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=readFileSync(require('node:path').join(__dirname,'../hello-theme-child-master/assets/jj-arcade/games/gb-badge-catcher.html'),'utf8');const core=html.match(/<script id="badge-catcher-core">([\s\S]*?)<\/script>/)[1];const sandbox={};vm.runInNewContext(core,sandbox);const {CatcherModel}=sandbox.BadgeCatcherCore;
function game(){const g=new CatcherModel(()=>.5);g.start();g.spawnClock=100;return g;}
function catchItem(g,type){g.items=[{type,size:43,x:g.bagX,y:g.mouthY-43/2-1,speed:200}];g.step(.02,0);}
let g=game();catchItem(g,'badge');assert.equal(g.score,10);assert.equal(g.streak,1);
for(let i=0;i<4;i++)catchItem(g,'badge');assert.equal(g.multiplier,2);assert.equal(g.score,60);
catchItem(g,'star');assert.equal(g.score,110);assert.equal(g.streak,5);
catchItem(g,'shoe');assert.equal(g.lives,2);assert.equal(g.multiplier,1);catchItem(g,'shoe');assert.equal(g.lives,2,'damage grace period');
g.invincible=0;catchItem(g,'shoe');g.invincible=0;catchItem(g,'shoe');assert.equal(g.phase,'over');assert.equal(g.lives,0);
g=game();g.pause();g.step(.05,1);assert.equal(g.elapsed,0);g.resume();g.step(.05,1);assert.equal(g.elapsed,.05);
g=game();g.elapsed=59.99;g.step(.02,0);assert.equal(g.phase,'over');assert.equal(g.elapsed,60);
g=game();for(let i=0;i<100;i++)g.step(.05,-1);assert(g.bagX>=g.bagWidth/2);g.resize(410);assert(g.bagX>=g.bagWidth/2);for(let i=0;i<100;i++)g.step(.05,1);assert(g.bagX<=g.width-g.bagWidth/2);
g.streak=8;g.multiplier=2;g.items=[{type:'badge',size:43,x:10,y:650,speed:100}];g.step(.02,0);assert.equal(g.multiplier,1);assert.equal(g.lives,3,'missed badge does not cost a life');
g.start();assert.equal(g.score,0);assert.equal(g.elapsed,0);assert.equal(g.lives,3);assert.equal(g.items.length,0);
console.log('PASS: scoring, multiplier, stars, collision grace, game over, pause, timer, resizing, movement bounds, missed badges, restart.');
