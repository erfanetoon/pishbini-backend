const Errors = {
  // Main
  urlInvalid: "مسابقه ای با این شناسه یافت نشد!",
  entryInvalid: "شما در این مسابقه ثبت نام نکرده اید!",
  periodInvalid: "هفته ای با این شناسه یافت نشد!",
  matchInvalid: "بازی ای با این شناسه یافت نشد!",
  statusFalse:
    "وضعیت شما در سیستم غیرفعال می باشد، برای حل این مشکل با ادمین در ارتباط باشید.",

  // Predict
  predictSuccess: "پیشبینی با موفقیت انجام شد.",
  predictError: "پیشبینی شما ثبت نشد!",
  notCurrectTeam: "تیمی که انتخاب کرده اید نادرست میباشد!",
  submitScoreError: "ثبت نتیجه با مشکل مواجه شده است!",
  submitScoreSuccess: "ثبت نتیجه موفقیت انجام شد.",

  // Admin
  addMatchSuccess: "اضافه کردن بازی با موفقیت انجام شد.",
  editMatchSuccess: "ویرایش بازی با موفقیت انجام شد.",
  deleteMatchSuccess: "حذف بازی با موفقیت انجام شد.",
  addPeriodSuccess: "اضافه کردن هفته با موفقیت انجام شد.",
  editPeriodSuccess: "ویرایش هفته با موفقیت انجام شد.",
  deletePeriodSuccess: "حذف هفته با موفقیت انجام شد.",
  activePeriodSuccess: "فعال کردن هفته با موفقیت انجام شد.",
  addCompetitionSuccess: "اضافه کردن مسابقه با موفقیت انجام شد.",
  editCompetitionSuccess: "ویرایش مسابقه با موفقیت انجام شد.",
  deleteCompetitionSuccess: "حذف مسابقه با موفقیت انجام شد.",
  repetitiveCompetition: "مسابقه ای با این آدرس در سیستم وجود دارد!",
  cantDeleteCompetiiton: "برای این مسابقه هفته و یا کاربری قرار داده شده است!",
  cantDeletePeriod: "برای این هفته بازی ای قرار داده شده است!",
  cantDeleteMatch: "برای این بازی پیشبینی ای قرار داده شده است!",
  deleteTeamSuccess: "حذف مسابقه با موفقیت انجام شد.",
  addTeamSuccess: "اضافه کردن تیم با موفقیت انجام شد.",
  editTeamSuccess: "ویرایش تیم با موفقیت انجام شد.",
  deleteTeamSuccess: "حذف تیم با موفقیت انجام شد.",
  statusTeamSuccess: "وضعیت تیم با موفقیت بروزرسانی شد.",
  notFoundTeam: "تیمی با این شناسه یافت نشد!",
  teamInCompetition: "این تیم در یک مسابقه حضور دارد!",
  submitTimeSuccess: "زمان بازی با موفقیت تغییر کرد.",
  hasThisEmailBefore: "این ایمیل قبلا در سیستم ثبت شده است!",
  addUserSuccess: "کاربر با موفقیت اضافه شد.",
  deleteUserSuccess: "کاربر با موفقیت حذف شد.",
  editUserSuccess: "کاربر با موفقیت ویرایش شد.",
  cantDeleteUser:
    "این کاربر در مسابقه ای ثبت نام کرده است و شما نمیتوانید این کاربر را حدف کنید!",

  // Auth
  emailInvalid: "کاربری با این پست الکترونیک یافت نشد!",
  passwordInvalid: "کلمه عبور وارد شده صحیح نمی باشد!",
  successRegister:
    "درخواست شما با موفقیت ثبت شد، در صورت تایید از طریق ایمیل به اطلاع شما خواهد رسید.",
  successForget: "کلمه عبور جدید از طریق ایمیل برای شما ارسال شد.",
  registerSuccess: "ثبت نام شما با موفقیت انجام شد.",
  registerDetail:
    "بعد از بررسی مدیر سایت، نتیجه از طریق ایمیل به اطلاع شما میرسد.",
  againRegister: "قبلا در این مسابقه ثبت نام کرده اید!",
  notAuthenticated:
    "احراز هویت شما از بین رفته است و باید دوباره وارد سیستم شوید.",

  // User
  changePasswordSuccess: "کلمه عبور شما با موفقیت تغییر کرد.",
  editInformationSuccess: "اطلاعات شما با موفقیت تغییر کرد.",
  editJobSuccess: "اطلاعات شما با موفقیت تغییر کرد.",
  jobNotFound: "شغلی با این شناسه یافت نشد!",
  existUserNotFound: "کاربری با این شناسه یافت نشد!",
  notUserForThisCompetition: "کاربری با این شناسه برای این مسابقات یافت نشد!",
  notFoundImage: "تصویری انتخاب نشده است!",
  uploadAvatarSuccess: "تصویر پروفایل با موفقیت تغییر کرد.",
};

module.exports = Errors;
