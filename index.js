// Import stylesheets
import "./style.css";
import "./system_msg.css";

// Firebase App (the core Firebase SDK) is always required and must be listed first
import { initializeApp } from "firebase/app";

// Add the Firebase products and methods that you want to use
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAONoYskX2-JwXs9OgKruPByK8b-l7IojQ",
  authDomain: "ensyu-69ff1.firebaseapp.com",
  projectId: "ensyu-69ff1",
  storageBucket: "ensyu-69ff1.appspot.com",
  messagingSenderId: "462168822297",
  appId: "1:462168822297:web:c152a0ae88bc3537f51088"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tableName = "reservation";

/* ------------------------------------------
 * 一覧表示
 * ---------------------------------------- */
const readList = async function readList() {
  //データベースからデータを読み込む
  const docsSnap = await getDocs(query(collection(db, tableName)));
  const resultSet = docsSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

  //テーブルを組み立てる
  let tableStr = "<table border='1'>";
  tableStr += "<tr>";
  dbColumns.forEach((element) => (tableStr += "<th class='" + element.columnId + "'>" + element.columnName + "</th>"));
  tableStr += "<th>操作</th>";
  tableStr += "</tr>";
  for (let i = 0; i < resultSet.length; i++) {
    tableStr += "<tr>";
    dbColumns.forEach((element) => (tableStr += "<td>" + resultSet[i][element.columnId] + "</td>"));
    tableStr += "<td>";
    tableStr += "<input  type='button' value='選択' class='btnSelect' onClick='dbRead(\"" + resultSet[i].id + "\");'> ";
    tableStr += "</td>";
    tableStr += "</tr>";
  }
  tableStr += "</table>";

  //テーブルを画面（コンテンツエリア）に出力する
  document.getElementById("list_area").innerHTML = tableStr;

  //状態に応じて適切なボタンを表示する
  btnDisp("released"); //選択解除
};

/* ------------------------------------------
 * レコード新規登録（追加）
 * ---------------------------------------- */
const recordCreate = async function recordCreate() {
  if (dataValidation() == false) {
    //フォームから値を取得し、登録用のレコードにまとめる
    let record = getRecord();

    //登録先（テーブル）へのリンクを取得する
    const tableRef = doc(collection(db, tableName));

    //レコードを追加する
    await setDoc(tableRef, record);

    //フォームの値をクリアする
    formCrear();

    //エラーメッセージを消去する
    document.getElementById("error_message_area").innerHTML = "";

    //一覧を再表示する
    readList();
  } else {
    document.getElementById("error_message_area").innerHTML = "未入力エラー：必須入力項目が未入力です。";
  }
};

/* ------------------------------------------
 * レコード選択
 * ---------------------------------------- */
const recordRead = async function recordRead(id) {
  const docSnap = await getDoc(doc(db, tableName, id));

  //入力フォームに値をセットする
  dbColumns.forEach((element) => {
    document.getElementById(element.columnId).value = docSnap.data()[element.columnId];
  });
  document.getElementById("id").value = id;

  //状態に応じて適切なボタンを表示する
  btnDisp("selected"); //選択中

  //エラーメッセージを消去する
  document.getElementById("error_message_area").innerHTML = "";
};

/* ------------------------------------------
 * レコード選択解除
 * ---------------------------------------- */
const recordRelease = async function recordRelease() {
  //フォームの値をクリアする
  formCrear();

  //エラーメッセージを消去する
  document.getElementById("error_message_area").innerHTML = "";

  //状態に応じて適切なボタンを表示する
  btnDisp("released"); //選択解除
};

/* ------------------------------------------
 * レコード更新
 * ---------------------------------------- */
const recordUpdate = async function recordUpdate() {
  const dataId = document.getElementById("id").value.trim();

  if (dataValidation() == false) {
    //フォームから値を取得し、登録用のレコードにまとめる
    let record = getRecord();
    record["id"] = dataId;

    //登録先（レコード）へのリンクを取得する
    const recordRef = doc(db, tableName, record["id"]);

    //レコードを更新登録する
    await setDoc(recordRef, record);

    //フォームの値をクリアする
    formCrear();

    //エラーメッセージを消去する
    document.getElementById("error_message_area").innerHTML = "";

    //一覧を再表示する
    readList();
  } else {
    document.getElementById("error_message_area").innerHTML = "未入力エラー：必須入力項目が未入力です。";
  }
};

/* ------------------------------------------
 * 入力値の検証（必須入力のみチェック）
 * ---------------------------------------- */
function dataValidation() {
  let isError = false; //問題なし:false
  //フォームから値を取得し、登録用のレコードにまとめる
  dbColumns.forEach((element) => {
    let dataValue = document.getElementById(element.columnId).value.trim();
    if ((element.required == "Y" || element.required == "y") && dataValue == "") {
      isError = true;
    }
  });
  return isError;
}

/* ------------------------------------------
 * 入力値の取得
 * ---------------------------------------- */
function getRecord() {
  let record = {};
  //フォームから値を取得し、登録用のレコードにまとめる
  dbColumns.forEach((element) => {
    record[element.columnId] = document.getElementById(element.columnId).value.trim();
  });
  return record;
}

/* ------------------------------------------
 * レコード削除
 * ---------------------------------------- */
const recordDelete = async function recordDelete() {
  const dataId = document.getElementById("id").value.trim();
  const docRef = doc(db, tableName, dataId);

  //レコードを削除する
  await deleteDoc(docRef);

  //フォームの値をクリアする
  formCrear();

  //エラーメッセージを消去する
  document.getElementById("error_message_area").innerHTML = "";

  //一覧表示を再表示する
  readList();
};

/* ------------------------------------------
 * ボタン表示の設定
 * ---------------------------------------- */
function btnDisp(status) {
  if (status == "selected") {
    //新規登録ボタンを非表示にする
    document.getElementById("btn_create").style.display = "none";

    //更新ボタンを表示する
    document.getElementById("btn_update").style.display = "inline";

    //削除ボタンを表示する
    document.getElementById("btn_delete").style.display = "inline";

    //選択解除ボタンを表示する
    document.getElementById("btn_release").style.display = "inline";
  } else if (status == "released") {
    //新規登録ボタンを表示する
    document.getElementById("btn_create").style.display = "inline";

    //更新ボタンを非表示にする
    document.getElementById("btn_update").style.display = "none";

    //削除ボタンを非表示にする
    document.getElementById("btn_delete").style.display = "none";

    //選択解除ボタンを非表示にする
    document.getElementById("btn_release").style.display = "none";
  } else {
    //新規登録ボタンを非表示にする
    document.getElementById("btn_create").style.display = "none";

    //更新ボタンを非表示にする
    document.getElementById("btn_update").style.display = "none";

    //削除ボタンを非表示にする
    document.getElementById("btn_delete").style.display = "none";

    //選択解除ボタンを非表示にする
    document.getElementById("btn_release").style.display = "none";
  }
}

/* ------------------------------------------
 * フォームの値をクリアする
 * ---------------------------------------- */
function formCrear() {
  dbColumns.forEach((element) => {
    document.getElementById(element.columnId).value = "";
  });
  document.getElementById("id").value = "";
}

/* ------------------------------------------
 * テーブル定義およびテキスト入力フィールドの確認
 * ---------------------------------------- */
function checkTableDefinition() {
  let isErrorForm = false; //テーブル定義にカラムが有るが、対応するテキスト入力フィールドが無い場合
  let isErrorTable = false; //テキスト入力フィールドはあるが、対応するカラムがテーブル定義に無い場合
  let isErrorNum = false; //テキスト入力フィールドと対応するカラムの数が一致していない場合
  let isErrorDuplicate = false; //テーブル定義のIDが重複している場合

  //テーブル定義をもとに対応するテキスト入力フィールドがあるかを確認する
  const checkForm = (oneColumn) => document.getElementById(oneColumn.columnId) === null;
  isErrorForm = dbColumns.some(checkForm);

  //テキスト入力フィールドをもとに、テーブル定義にカラムがあるかを確認する
  const formDoms = Array.from(document.getElementsByTagName("input"));
  const inputTextForm = formDoms.filter((oneForm) => oneForm.type == "text");
  inputTextForm.forEach((oneForm) => {
    const checkTable = (oneColumn) => oneColumn.columnId === oneForm.id;
    if (isErrorTable == false) {
      isErrorTable = !dbColumns.some(checkTable);
    }
  });

  //テキスト入力フィールドの数と、テーブル定義のカラム数が一致するかを確認する
  if (dbColumns.length != inputTextForm.length) {
    isErrorNum = true;
  }

  //テーブル定義のIDが重複しているかを確認する
  const tableIDs = dbColumns.map((oneColumn) => oneColumn.columnId);
  let duplicatedIds = tableIDs.filter((value, index, array) => {
    return array.indexOf(value) !== index;
  });
  if (duplicatedIds.length > 0) {
    isErrorDuplicate = true;
  }

  //エラーを表示する
  if (isErrorForm) {
    let msgStr = "<div class='systemMessageArea'>";
    msgStr += "<h3>テーブル定義未完了：列IDの不整合</h3>";
    msgStr += "<p>データベースの「列ID（columnId）」と「入力フォームのID属性」が不整合のため、一覧表示できません。</p>";
    msgStr += "<p>この問題を解決するには、「列ID（columnId）」とテキスト入力フィールドの「ID属性」が一致しているかを確認してください。</p>";
    msgStr += "<p>一致している場合は、テキスト入力フィールドの「ID属性」が重複している可能性があります。</p>";
    msgStr += "</div>";
    document.getElementById("list_area").innerHTML = msgStr;
    btnDisp();
  } else if (isErrorTable) {
    let msgStr = "<div class='systemMessageArea'>";
    msgStr += "<h3>テーブル定義未完了：列IDの不整合</h3>";
    msgStr += "<p>データベースの「列ID（columnId）」と「入力フォームのID属性」が不整合のため、一覧表示できません。</p>";
    msgStr += "<p>この問題を解決するには、「列ID（columnId）」とテキスト入力フィールドの「ID属性」が一致しているかを確認してください。</p>";
    msgStr += "<p>一致している場合は、「列ID（columnId）」が重複している可能性があります。</p>";
    msgStr += "</div>";
    document.getElementById("list_area").innerHTML = msgStr;
    btnDisp();
  } else if (isErrorNum) {
    let msgStr = "<div class='systemMessageArea'>";
    msgStr += "<h3>テーブル定義未完了：数の不一致</h3>";
    msgStr += "<p>「テキスト入力フィールド」の数と、データベース構築エリアに記載されている「テーブルの列」の数が不一致のため、一覧表示できません。</p>";
    msgStr += "<p>この問題を解決するには、上記のどちらかを追加あるいは削除して数を一致させてください。</p>";
    msgStr += "</div>";
    document.getElementById("list_area").innerHTML = msgStr;
    btnDisp();
  } else if (isErrorDuplicate) {
    let msgStr = "<div class='systemMessageArea'>";
    msgStr += "<h3>テーブル定義未完了：IDの重複</h3>";
    msgStr += "<p>データベース構築エリアに記載されている「列ID（columnId）」が重複しているため、一覧表示できません。</p>";
    msgStr += "<p>この問題を解決するには、列ごとに異なる「列ID（columnId）」を記載してください。</p>";
    msgStr += "</div>";
    document.getElementById("list_area").innerHTML = msgStr;
    btnDisp();
  } else {
    readList();
  }
}

window.readList = readList;
window.dbRead = recordRead;
window.recordCreate = recordCreate;
window.recordRelease = recordRelease;
window.recordUpdate = recordUpdate;
window.recordDelete = recordDelete;

checkTableDefinition();
