var popDiv = document.getElementById('popup');
var jobDiv = document.getElementById('jobActive');

//잉여 카드 클릭하면 보여주는 함수
function showCard(li, card){
  var surplusCard = document.getElementsByClassName('surplus-card');

  for( var i = 0; i < surplusCard.length; i++){
    if(surplusCard[i] == li){
      li.innerHTML = card[i];
    }
  }
}

//유저 목록 셀렉트 삼입하는 함수
function selectUsers(people, myJob){
  var me = document.getElementById('myName').text;
  var select = document.createElement('select');
  select.className = "select-user form-control"; 

  //천리안은 카드랑 유저선택중 하나만 가능합니다 :)
  select.onclick = function(){
    if(myJob == "천리안"){
      var ul = document.getElementById('cards');

      if(ul){
        jobDiv.removeChild(ul);
      }
    }
  }

  for(var i = 0; i < people.length; i++){
    if(people[i] != me){
      var option = document.createElement('option');
      option.text = people[i];
      option.value = people[i];
      select.appendChild(option);
    }
  }

  jobDiv.appendChild(select);
  
}

function surplusCard(card, myJob){
  var ul = document.createElement('ul');
  var cardClick = 0;

  ul.id = "cards";
 
  for(var i = 0; i < card.length; i++){
    var li = document.createElement('li');

    li.className = "surplus-card";
    li.onclick = function(){
      cardClick++;
 
      if(myJob == "천리안"){
        var select = document.getElementsByTagName('select');

        if(select[0]){
           jobDiv.removeChild(select[0]);
        }
      }

      if(cardClick <=2){
        var indexLi = this;
        showCard(indexLi, card);
      } 
    }

    ul.appendChild(li);
  }

  jobDiv.appendChild(ul);
}

function jobDivRemove(){
  while(jobDiv.hasChildNodes()){
    jobDiv.removeChild(jobDiv.firstChild);
  }
}


function warewolf(game, myJob){
  if(myJob == "늑대인간"){
    if(game.ware.length == 1){
      var popup = new Popup(popDiv, {width:300, height:150});
      var time;
      surplusCard(game.card, myJob); 
      popup.open();

      time = setTimeout(function(){
        jobDivRemove();
        popup.close();
       clearTimeout(time);
      }, 5000);

    }else if(game.ware.length >= 2){
      socket.emit('showWare', {});
    }
  }
};

function minion(game, myJob){
  if(myJob == "미니언"){
    socket.emit("showMinion", {});
  }
};

function mason(game, myJob){
  if(myJob == "비밀요원"){
    socket.emit("showMason", {});
  }
};

function seer(game, myJob, people){
  if(myJob == "천리안"){
    var popup = new Popup(popDiv, {width:300, height:200});
    var time = null;

    selectUsers(people, myJob);
    surplusCard(game.card, myJob);
    popup.open();

    time = setTimeout(function(){
      var user = document.getElementsByClassName('select-user')[0];

      if(user !== undefined){
        socket.emit("showSeer", {user:user.value});
      }

      jobDivRemove();
      popup.close();
      
      clearTimeout(time);
    }, 5000);

  }
};

function robber(people, myJob, wake){
  var time;
  if(myJob == "도둑"){
    var popup = new Popup(popDiv, {width:300, height:200});
    
    selectUsers(people, myJob);
    popup.open();
 
    time = setTimeout(function(){
      var select = document.getElementsByClassName('select-user')[0].value;
      socket.emit("showRobber", {myJob:myJob, user:select});  
      socket.emit("nextTurn", {myJob:myJob, wake:wake});
      
      jobDivRemove();
      popup.close();
      clearTimeout(time);
    }, 5000);    

  }else{
    time = setTimeout(function(){
      socket.emit("nextTurn", {myJob:myJob, wake:wake});
      clearTimeout(time);
    }, 5000); 
  }
}

function troubleMaker(people, myJob, wake){
  var time;

  if(myJob === "문제아"){
    var popup = new Popup(popDiv, {width:300, height:200});
    var me = document.getElementById('myName').text;
    var select = document.createElement('select');
    select.className = "select-user form-control";

    for(var i = people.length-1; i >= 0; i--){
      if(people[i] != me){
        var option = document.createElement('option');
        option.text = people[i];
        option.value = people[i];
        select.appendChild(option);
      }
    }

    jobDiv.appendChild(select);
    selectUsers(people, myJob);

    popup.open();
 
    time = setTimeout(function(){
      var select = document.getElementsByClassName('select-user')[0].value;
      var select2 = document.getElementsByClassName('select-user')[1].value;

      socket.emit("showTrouble", {myJob:myJob, user1:select, user2:select2});  
      socket.emit("nextTurn", {myJob:myJob, wake:wake});
      
      jobDivRemove();
      popup.close();
      clearTimeout(time);
    }, 5000);    

  }else{
    time = setTimeout(function(){
      socket.emit("nextTurn", {myJob:myJob, wake:wake});
      clearTimeout(time);
    }, 5000);
  }
};

function drunk(game, myJob){
  var time;

  if(myJob === "주정뱅이"){

  }
}

function moveNight(game, people, myJob, wake){
  var moveWake = game.wake;
  
  if(wake < moveWake){
    switch(wake){
      case 0: //도플갱어
        socket.emit('nextTurn', {myJob:myJob, wake:wake}); 
        break;
      case 1:
        warewolf(game, myJob);
        seer(game, myJob, people);
        minion(game, myJob);
        mason(game, myJob);
        socket.emit('nextTurn', {myJob:myJob, wake:wake});
        break;
      case 2:
        robber(people, myJob, wake);
        break;
      case 3:
        troubleMaker(people, myJob, wake);
        break;
      case 4:
        drunk(game, myJob);
        break;
      case 5:
        //insomniac(game, myJob);
        break;
    }
  }else{
    setTimeout(function(){
      socket.emit('checkVote', {});
    }, 50000);
  }
}
