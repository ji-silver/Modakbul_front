import { CART_KEY_LIST, CART_VALUE_LIST } from "./const.js";
import { chageNumberToLocaleString } from "../utils/index.js";
import { checkAuth } from "../utils/index.js";

const { isLoggedIn, token } = checkAuth();

let cartData = [
  {
    id: 1,
    src: "https://bellenuit.kr/web/product/medium/202210/9c781c64ee97abde8109dc1c860c4076.jpg",
    number: 4,
    name: "쫄깃쫄깃 텐트",
    company: "모닥불 컴퍼니",
    price: 1000000,
    summary: "요약입니다~~",
  },
  {
    id: 2,
    src: "https://bellenuit.kr/web/product/medium/202210/9c781c64ee97abde8109dc1c860c4076.jpg",
    number: 1,
    name: "통통한 모닥불",
    company: "통통 컴퍼니",
    price: 30000,
    summary: "요약입니다~~",
  },
  {
    id: 3,
    src: "https://bellenuit.kr/web/product/medium/202210/9c781c64ee97abde8109dc1c860c4076.jpg",
    number: 2,
    name: "한국 모기장",
    company: "한국 컴퍼니",
    price: 1000,
    summary: "요약입니다~~",
  },
  {
    id: 4,
    src: "https://bellenuit.kr/web/product/medium/202210/9c781c64ee97abde8109dc1c860c4076.jpg",
    number: 3,
    name: "야호 야호",
    company: "야호 컴퍼니",
    price: 124000,
    summary: "요약입니다~~",
  },
];

/**
 * 로그인한 유저의 장바구니 데이터를 얻기 위한 API 통신 함수
 */
async function getCartData() {
  // 장바구니 데이터 API 통신
  const response = await fetch("http://localhost:5000/api/carts/view", {
    method: "GET",
    headers: {
      Authorization: "bearer " + token,
    },
  });

  cartData = await response.json();
  console.log(cartData);
}

// 생각해보니까 비회원 유저도 장바구니를 쓸 수 있잖아?
// localStorage에 담겨져 있는 장바구니에 대해서 프론트 팀과 논의 필요
// renderCarts()에서 로그인/비로그인 분기 처리 필요
// 로그인은 fetch로 데이터 가져오고, 비로그인은 localStorage에서 데이터 가져오고

/**
 * 로그인 유저의 장바구니 데이터를 받아와서 렌더링하는 함수
 */
async function renderCarts() {
  const cartsDiv = document.getElementsByClassName("carts")[0];

  // 리렌더링이 트리거된 경우 자식 노드를 모두 삭제하고 새로운 데이터로 다시 렌더링.
  cartsDiv.replaceChildren();

  // 회원/비회원 분기 처리를 통한 장바구니 데이터 할당
  if (isLoggedIn) {
    getCartData();
  } else {
    cartData = localStorage.getItem("cartData");
  }

  for (let i = 0; i < cartData.length; i++) {
    const cartDiv = document.createElement("div");
    cartDiv.classList.add(
      "d-flex",
      "border",
      "border-success",
      "justify-content-between",
      "mb-4",
      "p-2",
      "rounded"
    );

    const productDiv = document.createElement("div");
    productDiv.classList.add("d-flex", "w-75", "align-items-center");

    const img = document.createElement("img");
    img.src = `${cartData[i].src}`;
    img.alt = `${cartData[i].summary}`;
    img.classList.add("rounded", "w-25", "pe-2");

    const ul = document.createElement("ul");
    ul.classList.add("m-0", "p-0");

    CART_KEY_LIST.forEach((key, index) => {
      const li = document.createElement("li");

      if (key === "수량") {
        const input = document.createElement("input");

        input.type = "number";
        input.max = "10";
        input.min = "1";
        input.value = `${cartData[i].number}`;
        input.classList.add("number_input");

        // input 변경이 있을 때마다 총 금액 계산 실행
        input.addEventListener("click", renderTotalPrice);

        ul.appendChild(input);
      } else {
        li.innerText = `${key} : ${
          typeof cartData[i][CART_VALUE_LIST[index]] === "number"
            ? `${chageNumberToLocaleString(
                cartData[i][CART_VALUE_LIST[index]]
              )} 원`
            : cartData[i][CART_VALUE_LIST[index]]
        }`;

        ul.appendChild(li);
      }
    });

    productDiv.appendChild(img);
    productDiv.appendChild(ul);
    cartDiv.appendChild(productDiv);

    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("d-flex", "align-items-end");

    const button = document.createElement("button");
    button.type = "button";
    button.innerText = "제거";
    button.classList.add(
      `delete_button_${cartData[i].id}`,
      "btn",
      "btn-outline-danger"
    );

    // 제거 버튼 클릭 시 API 통신 진행
    button.addEventListener("click", () => cartDeleteHandler(cartData[i].id));

    buttonDiv.appendChild(button);

    // cartDiv.appendChild(img);
    // cartDiv.appendChild(ul);
    // cartDiv.appendChild(button);
    cartDiv.appendChild(buttonDiv);
    cartsDiv.appendChild(cartDiv);
  }

  renderTotalPrice();
}

/**
 * 장바구니에서 데이터 하나를 제거하는 함수
 * @param {String} id 장바구니에 담긴 데이터 하나의 id
 */
async function cartDeleteHandler(id) {
  // 회원의 경우
  if (isLoggedIn) {
    // 장바구니 삭제 API 통신
    // 삭제할 제품의 id를 body로 보낸다.
    // await fetch("url", {
    //   method: "DELETE",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: {
    //     id,
    //   },
    // });

    // 화면에서 지우기
    // API 통신 성공 시 삭제 / 실패 시 alert 후 return
    cartData = cartData.filter((item) => item.id !== id);
  }

  // 비회원의 경우
  if (!isLoggedIn) {
    // 화면에서 지우기
    cartData = cartData.filter((item) => item.id !== id);

    // 변경된 데이터를 localStorage의 cartData에 반영
    localStorage.setItem("cartData", JSON.stringify(cartData));
  }

  // 리렌더링
  renderCarts();
}

/**
 * 장바구니의 총 금액을 렌더링하는 함수
 */
function renderTotalPrice() {
  const totalPrice = chageNumberToLocaleString(calculateTotalPrice());

  const h2 = document.querySelector(".total_price");
  h2.innerText = `총 금액 : ${totalPrice} 원`;
}

/**
 * 장바구니에 담긴 물건의 총 금액을 계산하는 함수
 * @returns {Number} 장바구니 총 금액
 */
function calculateTotalPrice() {
  const input = document.getElementsByClassName("number_input");

  const totalPrice = cartData.reduce((acc, curr, index) => {
    return acc + parseInt(input[index].value) * curr.price;
  }, 0);

  return totalPrice;
}

const orderButton = document.querySelector(".order_button");

// 주문하기 버튼을 누르면 주문 진행 페이지로 이동한다.
orderButton.addEventListener("click", orderHandler);

/**
 * 구매 진행에 필요한 사항을 객체에 담아 주문 진행 페이지로 전달하는 함수
 */
function orderHandler() {
  // 하나의 원소는 이름, 수량, 총 가격, 회사 데이터를 포함한다.
  let orderData = {
    data: [],
    total: null,
  };

  cartData.forEach((item, index) => {
    const input = document.getElementsByClassName("number_input");

    orderData.data = [
      ...orderData.data,
      {
        name: item.name,
        number: parseInt(input[index].value),
        company: item.company,
        img: item.src,
        summary: item.summary,
      },
    ];
  });

  orderData.total = calculateTotalPrice();

  // 민감한 정보는 아니기 때문에 localStorage로 저장해서 사용
  localStorage.setItem("orderData", JSON.stringify(orderData));

  // 주문 진행 페이지로 이동
  window.location.href = "orderingPage.html";
}

renderCarts();
