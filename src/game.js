
var gametime;
var notesnum;
var notes_dealt;
var musicpass="res/AXION.mp3";
var note_sort=[];
var note_data=[];


var scoreLabel;
var startflag;

var scoredata;

function Calu_Y(just,nowtime,speed) {
    var y=80+(just-nowtime)*speed*0.01;
    return y;
}

function Calu_X(lane){
    switch(lane){
        case 1:return 260;break;
        case 2:return 360;break;
        case 3:return 460;break;
        case 4:return 610;break;
        case 5:return 610;break;
        case 6:return 610;break;
        case 7:return 610;break;
    }

}

var SCORE= function(tap2,hold2){//holdnotesは123レーンのみで可能
    this.tap=tap2;
    this.hold=hold2;

    this.objectnum=(tap2*100+hold2*150);
    this.bonus=(1000000-5000)%( this.objectnum)+5000;

    this.point=(1000000-this.bonus)/this.objectnum;

    this.tapjudge=[0,0,0,0];//3perfect 2great 1good 0miss 100 70 40 0
    this.holdjudge=[0,0,0,0];//3perfect 2great 1good 0miss 150 115 60 0 

    this.bonusflag=0;
    this.score=0;

    this.combo=0;
    this.maxcombo=0;


    this.add=function(sort,judge){
        switch(sort){
            case 1:
                this.tapjudge[judge]++;
                if(judge!=0){
                    this.combo++;
                }
                else {
                    this.combo=0;
                }
                break;
            case 2:
                this.holdjudge[judge]++;
                if(judge!=0){
                    this.combo++;
                }
                else {
                    this.combo=0;
                }
                break;


        }

        if(this.maxcombo<this.combo){
            this.maxcombo=this.combo;

        }

    }
    this.RE=function(){
        this.score=this.point*(this.tapjudge[1]*40+this.tapjudge[2]*70+this.tapjudge[3]*100+this.holdjudge[1]*60+this.holdjudge[2]*110+this.holdjudge[3]*150)

        if(this.bonusflag==1){
            this.score+=this.bonus;
        }
        else if(this.tap+this.hold==this.maxcombo){
            this.bonusflag=1;
        }

    }
    
}

var TAP = function(lanenum,timems,speed){//lane 123 左側　4↑ 5↓ 6→ 7← 
        this.lane=lanenum;
        this.time=timems;
        this.graph;

        this.speed=speed;
        this.hitflag=0;//0未処理　1見逃しmiss 2処理された
        this.judge=-1;//0miss 1good 2great 3perfect

        this.x;
        this.y;
        
        this.calu=function(time1000){
            if(this.hitflag<2){
                this.x=Calu_X(this.lane),
                this.y=Calu_Y(this.time,time1000,this.speed)
            }
            else {
                this.x=1500;
                this.y=1500;

            }

        }

        this.deal=function(keystate,time1000){
            var lag=(time1000)-(this.time)-25;
            if(this.hitflag==0){
                if(lag>0){
                    //cc.audioEngine.playEffect("res/hit.wav",false);
                    //this.hitflag++;
                }
                if(keystate==1&&(lag<50&&lag>-50)){
                    this.hitflag=2;
                    this.judge=3;
                    INPUT(this.lane,1);
                    return 1;
    
                }
                else if(keystate==1&&(lag<100&&lag>-100)){
                    this.hitflag=2;
                    this.judge=2;
                    INPUT(this.lane,1);
                    return 2;
                }
                else if(keystate==1&&(lag<150&&lag>-150)){
                    this.hitflag=2;
                    INPUT(this.lane,1);
                    this.judge=1;return 3;
                }
                else if(lag>=150){
                    this.hitflag=1;
                    this.judge=0;return 4;
                }

            }

            return 0;

        }

        

        

}

var HOLD = function(lanenum,startt,endt,speed){//holdnotesは123レーンのみで可能
        this.lane=lanenum;
        this.time=startt;
        this.time2=endt;
        this.graph;
        this.speed=speed;
        this.hitflag=0;//0未処理　1見逃しmiss 2ホールド中　3処理済み

        this.judge1=-1;//0miss 1good 2great 3perfect
        this.judge2=-1;//0miss 1good 2great 3perfect
}

/*function READY(name){
    var s = cc.TransitionFade.create(2, new name());
    cc.director.runScene(s);
   
}
*/



var tapnum;
var tapnote;
var holdnum;

var SCORESHOW=cc.Layer.extend({
    sprite:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;


       


        return true;
    }
});


var sprite21;
var GAME_NOTES=cc.Layer.extend({
    sprite:null,
    
    init:function () {
        this._super();

        var size = cc.winSize;

        tapnum=0;
        holdnum=0;

        notesnum=0;
        notes_dealt=0;
        
        startflag=0;
        this.audioEngine = cc.audioEngine;
        //cc.audioEngine.preloadMusic(musicpass);
        //this.scheduleOnce(GAMESTART, 5);


        this.note_graph=[];
        
        cc.audioEngine.playMusic(musicpass,false);
        cc.audioEngine.pauseMusic();

        cc.loader.loadJson(res.chart,function(err,data){
          if(!err){
            for(var int =0;int<data.length;int++){
                note_sort.push(data[int].sort);
                if(data[int].sort==1){
                    note_data.push(new TAP(data[int].lane,data[int].time,data[int].speed));
                    tapnum++;

                }
                else if(data[int].sort==2){
                    note_data.push(new HOLD(data[int].lane,data[int].time,data[int].time2,data[int].speed));
                    holdnum++;
                }
            }   

            scoredata=new SCORE(tapnum,holdnum);
            notesnum=tapnum+holdnum;
          }
    
        });

       

        
        this.scheduleOnce(function() {
         
            
            
            for(var e=0;e<notesnum;e++){
                if(note_sort[e]==1){
                    
                    switch(note_data[e].lane){
                        case 1:
                        case 2:
                        case 3:
                        this.note_graph.push(new cc.Sprite(res.tap_png));
                        break;

                        case 4:
                        this.note_graph.push(new cc.Sprite(res.up_png));
                        break;
                        case 5:
                        this.note_graph.push(new cc.Sprite(res.down_png));
                        break;
                        case 6:
                        this.note_graph.push(new cc.Sprite(res.left_png));
                        break;
                        case 7:
                        this.note_graph.push(new cc.Sprite(res.right_png));
                        break;


                    }
            

                    this.note_graph[e].attr({
                        x: Calu_X(note_data[e].lane),
                        y: Calu_Y(note_data[e].time,gametime*1000,note_data[e].speed)
                    });
                   
                    this.addChild(this.note_graph[e], notesnum-e);
                }
            }
        }, 0.2);


        this.scheduleOnce(function() {
            cc.audioEngine.resumeMusic();


            startflag=1;
        }, 3);

        this.scheduleUpdate();
        

        return true;
    },
   
    update: function(dt) {   
        var flag=0;  

        


        if(startflag==1){
            gametime+=dt;
            scoredata.RE();
            //はじめから3s→スタート画面→自動で譜面スタート
            // dt秒ごとにこのメソッドが呼び出される


            
            for(var e=0;e<notesnum;e++){

                if(note_sort[e]==1){

                    flag=note_data[e].deal(INPUT(note_data[e].lane,0),gametime*1000);
                    switch(flag){
                        case 1:
                            layer1.add(0,note_data[e].lane);
                            scoredata.add(1,3);
                            cc.log(1);
                            
                            break;
                        case 2:
                            layer1.add(1,note_data[e].lane); scoredata.add(1,2);
                            break;
                        case 3:
                            layer1.add(2,note_data[e].lane); scoredata.add(1,1);
                            break;
                        case 4:
                            layer1.add(3,note_data[e].lane);scoredata.add(1,0);
                            break;
                    }
                    note_data[e].calu(gametime*1000);

                    this.note_graph[e].attr({
                        x: note_data[e].x,
                        y: note_data[e].y
                    });
                }


                
            }
        } 
            
    }
});




var GAME_BASE = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;

        gametime=0;
        notes_dealt=0;

        this.s_s=0;

        this.lane6 = new cc.Sprite(res.back_png);
        this.lane6.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(this.lane6, 0);

        this.lane5 = new cc.Sprite(res.bg_png);
        this.lane5.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.lane5.setScale(2.4,2.4);
        this.addChild(this.lane5, 0);

        this.scorest=[new cc.Sprite(),new cc.Sprite(),new cc.Sprite(),new cc.Sprite(),new cc.Sprite(),new cc.Sprite(),new cc.Sprite()];
        for(var t=0;t<7;t++){
            this.scorest[t].attr({
                x: size.width*0.5+80*(t-3),
                y: 320,
                scale:1.2
                
            });
            this.addChild(this.scorest[t], 1);

        }

        this.combost=[new cc.Sprite(),new cc.Sprite(),new cc.Sprite(),new cc.Sprite()];
        for(var t=0;t<4;t++){
            this.combost[t].attr({
                x: size.width*0.5-40+50*(t-3),
                y: 190,
                scale: 0.7
            });
            this.addChild(this.combost[t], 1);

        }

        this.scoreframe=[];

            for(var c3=0;c3<10;c3++){
                this.scoreframe.push(new cc.SpriteFrame.create(res.num, cc.rect(27+68*c3, 12, 68, 160)));
            }
    

        this.cs = new cc.Sprite(res.combo);
        this.cs.attr({
            x: size.width*0.5+75,
            y: 150,
            scale:0.6
        });
        this.addChild(this.cs, 1);

        this.lane1 = new cc.Sprite(res.lane_png);
        this.lane1.attr({
            x: size.width / 2-220,
            y: size.height / 2
        });
        this.addChild(this.lane1, 3);

        this.lane2 = new cc.Sprite(res.lane_png);
        this.lane2.attr({
            x: size.width / 2-120,
            y: size.height / 2
        });
        this.addChild(this.lane2, 3);

        this.lane3 = new cc.Sprite(res.lane_png);
        this.lane3.attr({
            x: size.width / 2-20,
            y: size.height / 2
        });
        this.addChild(this.lane3, 3);

        this.lane4 = new cc.Sprite(res.lane2_png);
        this.lane4.attr({
            x: size.width / 2+130,
            y: size.height / 2
        });
        this.addChild(this.lane4, 3);

        this.scheduleUpdate();
        return true;
    },

    update:function(){
        if(startflag==1){
            var number_s=[0,0,0,0,0,0,0]
            var s=scoredata.score;
            number_s[6]=s%10;
            number_s[5]=(s%100-number_s[6])/10;
            number_s[4]=(s%1000-number_s[5]*10-number_s[6])/100;
            number_s[3]=(s%10000-number_s[4]*100-number_s[5]*10-number_s[6])/1000;
            number_s[2]=(s%100000-number_s[3]*1000-number_s[4]*100-number_s[5]*10-number_s[6])/10000;
            number_s[1]=(s%1000000-number_s[2]*10000-number_s[3]*1000-number_s[4]*100-number_s[5]*10-number_s[6])/100000;
            number_s[0]=(s-number_s[1]*100000-number_s[2]*10000-number_s[3]*1000-number_s[4]*100-number_s[5]*10-number_s[6])/1000000;
    
            for(var q=0;q<7;q++){
                this.scorest[q].setSpriteFrame(this.scoreframe[number_s[q]]);
    
            }
    
    
            var combo_s=[0,0,0,0]
            var s=scoredata.combo;
            combo_s[3]=s%10;
            combo_s[2]=(s%100-combo_s[3])/10;
            combo_s[1]=(s%1000-combo_s[2]*10-combo_s[3])/100;
            combo_s[0]=(s%10000-combo_s[1]*100-combo_s[2]*10-combo_s[3])/1000;
            
            for(var q=0;q<4;q++){
                this.combost[q].setSpriteFrame(this.scoreframe[combo_s[q]]);
    
            }
        }
        else {

            for(var q=0;q<7;q++){
                this.scorest[q].setSpriteFrame(this.scoreframe[0]);
    
            }
    
    
           
            for(var q=0;q<4;q++){
                this.combost[q].setSpriteFrame(this.scoreframe[0]);
    
            }

        }
        

    }
});




var layer1
var GAME_S = cc.Scene.extend({
    onEnter:function () {
        this._super();

        //譜面の入力　読み込み
        //

        var layer = new GAME_BASE();
        
        layer1=new EFFECT();
        var layer2=new GAME_NOTES(); 
        layer2.init();
        var layer3=new D_PAD();
        this.addChild(layer);
        this.addChild(layer1);
        this.addChild(layer2);
        this.addChild(layer3);
    }
});