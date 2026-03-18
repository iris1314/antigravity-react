// 請將此程式碼複製並貼上到你的 Google Apps Script 專案中 (Extensions > Apps Script)
// 並且將專案部署為「網頁應用程式 (Web App)」，權限設定為「所有人 (Anyone)」。

const SHEET_QUESTIONS = '題目';
const SHEET_ANSWERS = '回答';

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    let result = {};
    if (action === 'getQuestions') {
      result = getQuestions(params.count || 10);
    } else if (action === 'submitScore') {
      result = submitScore(params.id, params.answers, params.passThreshold);
    } else {
      result = { error: 'Unknown action' };
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 處理 CORS 預檢請求
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.JSON);
}

function getQuestions(count) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_QUESTIONS);
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  
  // 隨機打亂題目
  const shuffled = rows.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  
  // 不包含解答欄位 (假設解答在 index 6，欄位 G)
  const questions = selected.map(row => ({
    id: row[0],
    question: row[1],
    options: {
      A: row[2],
      B: row[3],
      C: row[4],
      D: row[5]
    }
  }));
  
  return { success: true, questions: questions };
}

function submitScore(userId, answers, passThreshold) {
  const sheetQ = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_QUESTIONS);
  const qData = sheetQ.getDataRange().getValues();
  const qRows = qData.slice(1);
  
  // 建立題號與解答、題目的 Map
  const answerMap = {};
  const questionMap = {};
  qRows.forEach(row => {
    answerMap[row[0]] = row[6]; 
    questionMap[row[0]] = { text: row[1], options: { A: row[2], B: row[3], C: row[4], D: row[5] } };
  });
  
  // 在後端計算分數 (防止前端作弊)
  let correctCount = 0;
  const reviewData = [];
  answers.forEach(ans => {
    const correctAns = String(answerMap[ans.questionId]);
    const isCorrect = correctAns === String(ans.chosen);
    if (isCorrect) {
      correctCount++;
    }
    
    reviewData.push({
      questionId: ans.questionId,
      questionText: questionMap[ans.questionId] ? questionMap[ans.questionId].text : '',
      options: questionMap[ans.questionId] ? questionMap[ans.questionId].options : {},
      chosen: ans.chosen,
      correct: correctAns,
      isCorrect: isCorrect
    });
  });
  const score = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0; // 滿分100制
  const isPass = passThreshold !== undefined ? (score >= passThreshold) : false;
  
  const sheetA = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ANSWERS);
  const aData = sheetA.getDataRange().getValues();
  
  let userRowIndex = -1;
  for (let i = 1; i < aData.length; i++) {
    if (String(aData[i][0]) === String(userId)) {
      userRowIndex = i + 1;
      break;
    }
  }
  
  const now = new Date();
  let firstPassScoreMsg = isPass ? score : "";
  let attemptCountToPass = isPass ? 1 : "";
  
  if (userRowIndex !== -1) {
    const rowData = aData[userRowIndex - 1];
    let playCount = Number(rowData[1]) || 0;
    let totalScore = Number(rowData[2]) || 0;
    let highestScore = Number(rowData[3]) || 0;
    let existingPassScore = rowData[4] || "";
    let existingPassAttempts = rowData[5] || "";
    
    playCount++;
    totalScore += score;
    if (score > highestScore) highestScore = score;
    
    // 如果同 ID 已通關過，後續分數不覆蓋，僅在同列增加闖關次數
    if (!existingPassScore && isPass) {
      existingPassScore = score;
      existingPassAttempts = playCount;
    }
    
    sheetA.getRange(userRowIndex, 2).setValue(playCount);
    sheetA.getRange(userRowIndex, 3).setValue(totalScore);
    sheetA.getRange(userRowIndex, 4).setValue(highestScore);
    sheetA.getRange(userRowIndex, 5).setValue(existingPassScore); // 第一次通關分數
    sheetA.getRange(userRowIndex, 6).setValue(existingPassAttempts); // 花了幾次通關
    sheetA.getRange(userRowIndex, 7).setValue(now); // 最近遊玩時間
  } else {
    // 新增使用者: ID、闖關次數、總分、最高分、第一次通關分數、花了幾次通關、最近遊玩時間
    sheetA.appendRow([userId, 1, score, score, firstPassScoreMsg, attemptCountToPass, now]);
  }
  
  return { success: true, score: score, total: answers.length, review: reviewData };
}
