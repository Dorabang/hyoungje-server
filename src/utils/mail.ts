const FRONT_URL =
  process.env.ENV_NODE === 'development'
    ? process.env.DEV_FRONT_URL
    : process.env.PRODUCT_FRONT_URL;

export const generatePasswordResetEmail = (code: string, userId: string) => {
  return `<div style="background: #fafafa; padding: 40px">
  <div style="width: 120px; padding-bottom: 24px; margin: 0 auto">
    <a href="${FRONT_URL}">
      <img
        style="width: 100%; object-fit: contain"
        src="https://okdong-bucket.s3.ap-northeast-2.amazonaws.com/logo.png"
      />
    </a>
  </div>
  <div
    style="
      max-width: 640px;
      margin: 0 auto;
      background: white;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      padding: 20px 40px;
      color: #666;
    "
  >
    <h2 style="font-weight: 500; color: #333; font-size: 20px">
      회원님, 안녕하세요.
    </h2>
    <p>아래 링크를 통해 비밀번호를 재설정해주세요.</p>
    <p>이 링크는 5분 동안 유효합니다.</p>
    <p style="text-align: center; padding: 12px 24px">
      <a
        href="${FRONT_URL}/password/init-password?code=${code}&userId=${userId}"
        style="
          display: inline-block;
          background: rgba(191, 30, 46, 0.2);
          padding: 8px 16px;
          border-radius: 6px;
          margin: 12px 0;
          color: #121212;
          font-weight: 500;
        "
        >비밀번호 재설정하기</a
      >
    </p>
    <hr style="background-color: #ddd; height: 1px; border: 0" />
    <div>
      <p style="font-size: 12px; padding-top: 24px">
        본인이 아니라면
        <a href="${FRONT_URL}/login" target="_blank">홈페이지</a> 로그인
        후, 비밀번호를 변경해주세요.
      </p>
    </div>
  </div>

  <div style="text-align: center; padding: 24px 0">
    <p style="color: #999; font-size: 14px">
      옥동에서 보냄 ·
      <a
        href="${FRONT_URL}"
        style="text-decoration: none; color: #bf1e2e"
        target="_blank"
        >옥동</a
      >
    </p>
    <address style="color: #999; font-size: 14px">
      (52842) 경상남도 진주시 금곡면 인담리 700<br />Tel. 010-8856-1195 /
      E-mail. cjs863@daum.net / 사업자등록번호 605-92-39533
    </address>
  </div>
</div>`;
};

export const generateEmailVerificationEmail = (code: string) => {
  return `<div style="background: #fafafa; padding: 40px">
      <div style="width: 120px; padding-bottom: 24px; margin: 0 auto">
        <a href="${FRONT_URL}">
          <img
            style="width: 100%; object-fit: contain"
            src="https://okdong-bucket.s3.ap-northeast-2.amazonaws.com/logo.png"
          />
        </a>
      </div>
      <div
        style="
          max-width: 640px;
          margin: 0 auto;
          background: white;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          padding: 20px 40px;
          color: #666;
        "
      >
        <h2 style="font-weight: 500; color: #333; font-size: 20px">
          회원님, 안녕하세요.
        </h2>
        <p>회원가입을 위해 아래 코드를 복사하여 이메일 인증을 진행해주세요.</p>
        <p>이 인증 코드는 5분 동안 유효합니다.</p>
        <p style="text-align: center; padding: 12px 24px">
          <span
            style="
              display: inline-block;
              background: rgba(191, 30, 46, 0.2);
              padding: 8px 16px;
              border-radius: 6px;
              margin: 12px 0;
              color: #121212;
              font-weight: 500;
            "
            >${code}</span
          >
        </p>
        <hr style="background-color: #ddd; height: 1px; border: 0" />
        <div>
          <p style="font-size: 12px; padding-top: 24px">
            본인이 아니라면
            <a href="${FRONT_URL}/login" target="_blank">홈페이지</a> 로그인
            후, 비밀번호를 변경해주세요.
          </p>
        </div>
      </div>

      <div style="text-align: center; padding: 24px 0">
        <p style="color: #999; font-size: 14px">
          옥동에서 보냄 ·
          <a
            href="${FRONT_URL}"
            style="text-decoration: none; color: #bf1e2e"
            target="_blank"
            >옥동</a
          >
        </p>
        <address style="color: #999; font-size: 14px">
          (52842) 경상남도 진주시 금곡면 인담리 700<br />Tel. 010-8856-1195 /
          E-mail. cjs863@daum.net / 사업자등록번호 605-92-39533
        </address>
      </div>
    </div>`;
};
