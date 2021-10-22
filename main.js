//宣告狀態機
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished',
}

//圖片來源
const Symbols = [
    'https://image.flaticon.com/icons/svg/105/105223.svg',//黑桃
    'https://image.flaticon.com/icons/svg/105/105220.svg', //紅心
    'https://image.flaticon.com/icons/svg/105/105212.svg', //方塊
    'https://image.flaticon.com/icons/svg/105/105219.svg' //梅花
  ]

//渲染卡片
const view = {
  getCardElement (index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  
  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <p>${number}</p>
    <img src="${symbol}" />
    <p>${number}</p> 
    `
  },
  
  //設定數字 J / Q / K
  transformNumber(number) {
    switch (number) {
      case 1 : 
        return "A"
      case 11 :
        return "J"
      case 12 :
        return "Q"
      case 13 :
        return "K"
      default :
        return number
    }
  },
  
  //產生52張牌
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('');
  },

  //翻牌
  //flipCards(1,2,3,4,5) 可將N個參數變成陣列
  flipCards(...cards) {
    cards.map(card => {
      //console.log(card)
      if(card.classList.contains('back')) {
      //回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index)) 
        return
      }
      //回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  //新增完成配對牌面底色
  pairCards(...cards) {
    cards.map(cards => {
      cards.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}` ;
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried:${times} times`;
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animation',event =>
      event.target.classList.remove('wrong'),
      {once:true})
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score} </p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

//宣告model 設定暫存牌組
const model = {
  revealedCards: [],
  //比較revealedCards中暫存的兩個值是否相等
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === 
    this.revealedCards[1].dataset.index % 13
  },
  
  score: 0,

  triedTimes:0,

}

//宣告controller統一發派
const controller = {
  currentState : GAME_STATE.FirstCardAwaits,
  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //翻第1張牌等待翻第2張牌
  dispatchCardAction (card) {
    if(!card.classList.contains('back')){
      return
    }

    switch (this.currentState){
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        
        //判斷是否配對成功
        if(model.isRevealedCardsMatched()){
          //配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }  
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    
    console.log('currentState', this.currentState)
    console.log('revealedCards',model.revealedCards.map(card => card.dataset.index))
  },

  resetCards(){
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
    }
  }

  //洗牌演算法
  const utility = {
    getRandomNumberArray(count) {
      const number = Array.from(Array(count).keys())
      for(let index = number.length - 1 ; index > 0 ; index--){
        let randomIndex = Math.floor(Math.random() * (index + 1))
          ;[number[index] , number[randomIndex]] = [number[randomIndex] , number[index]]
    }
    return number
  }
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click',event => {
    controller.dispatchCardAction (card)
  })
})





