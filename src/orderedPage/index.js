import {
  STORAGE_NAME,
  SUMMARY_KEY_LIST,
  SUMMARY_PHRASE_LIST,
} from "./const.js";
import { checkAuth } from "../utils/index.js";

const { isLoggedIn, token } = checkAuth();

/**
 * 완료된 주문 정보를 얻기 위한 함수
 * @returns 주문 정보를 담고 있는 객체
 */
function getOrderData() {
  const orderData = JSON.parse(localStorage.getItem(STORAGE_NAME));

  return orderData;
}

/**
 * 주문 완료된 정보를 렌더링하는 함수
 */
function renderOrder() {
  const orderData = getOrderData();
  console.log(orderData);

  const summaryDiv = document.querySelector(".order_summary");

  const img = document.createElement("img");
  img.src = `http://localhost:5000/${orderData.cart[0].imgURL}`;
  img.alt = "상품 이미지";
  img.classList.add("rounded", "w-25", "pe-2");

  const ul = document.createElement("ul");
  ul.classList.add("m-0", "p-0");

  for (let i = 0; i < SUMMARY_PHRASE_LIST(orderData).length; i++) {
    const li = document.createElement("li");
    li.classList.add("mb-2");

    li.innerText = `${SUMMARY_KEY_LIST[i]} : ${
      SUMMARY_PHRASE_LIST(orderData)[i]
    }`;
    ul.appendChild(li);
  }

  summaryDiv.appendChild(img);
  summaryDiv.appendChild(ul);
}

const btn = document.getElementsByClassName("order_check_btn")[0];

btn.addEventListener("click", checkOrderList);

/**
 * 주문 내역을 확인하는 페이지로 이동하는 함수. 이동과 동시에 장바구니 데이터를 삭제한다.
 */
async function checkOrderList() {
  // 회원인 경우
  if (isLoggedIn) {
    try {
      const response = await fetch(
        "http://localhost:5000/api/carts/deleteAll",
        {
          method: "DELETE",
          headers: {
            Authorization: "bearer " + token,
          },
        }
      );

      if (response.ok) {
        // 주문 내역 페이지로 이동
        window.location.href = "checkOrderPage.html";
      }
    } catch (err) {
      console.log(err);
    }
  }

  // 비회원인 경우
  if (!isLoggedIn) {
    // 로컬에서 장바구니 삭제
    localStorage.removeItem("cartData");
  }
}

renderOrder();
