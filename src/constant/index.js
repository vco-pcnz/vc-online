export const termsType = {
  register: 0,
  broker: 1,
  investor: 2,
};

export const preMobileOpts = [
  { label: '+1', value: '1' }, // United States, Canada, etc.
  { label: '+86', value: '86' }, // China
  { label: '+64', value: '64' }, // NZ
  { label: '+44', value: '44' }, // United Kingdom
  { label: '+61', value: '61' }, // Australia
  { label: '+65', value: '65' }, // Singapore
  { label: '+353', value: '353' }, // Ireland
  { label: '+91', value: '91' }, // India
  { label: '+49', value: '49' }, // Germany
  { label: '+39', value: '39' }, // Italy
  { label: '+33', value: '33' }, // France
  { label: '+81', value: '81' }, // Japan
  { label: '+82', value: '82' }, // South Korea
  { label: '+852', value: '852' }, // Hong Kong
  { label: '+853', value: '853' }, // Macao
  { label: '+55', value: '55' }, // Brazil
  { label: '+66', value: '66' }, // Thailand
  { label: '+971', value: '971' }, // United Arab Emirates
  { label: '+966', value: '966' }, // Saudi Arabia
  { label: '+48', value: '48' }, // Poland
  { label: '+31', value: '31' }, // Netherlands
];

export const EMAIL_RULE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_RULE = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.{8,})/;

export const VERIFY_KEY = {
  EMAIL: 'email',
  MOBILE: 'mobile',
};

export const processRoutes = [
  '/process/one',
  '/process/two',
  '/process/three',
  '/process/four',
  '/process/five',
  '/process/six',
  '/process/seven',
  '/process/eight',
  '/process/nine',
  '/process/ten',
  '/process/eleven',
  '/process/twelve',
  '/process/thirteen',
];

export const processBlockName = {
  borrower: '借款人信息',
  project: '项目信息',
  cert: '证件资料',
  loan: '借款信息',
  lending: '放款信息',
  security: '抵押物信息',
  warranty: '其他安全信息',
  offer: '凭证信息',
};
