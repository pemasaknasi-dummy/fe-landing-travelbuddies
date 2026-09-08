import ErrorPageLayout from "./ErrorPageLayout";
import LockedIllustration from "./illustrations/LockedIllustration";

const Error401 = () => {
  return (
    <ErrorPageLayout
      headline="Masuk Dulu, Yuk"
      message={"Halaman ini khusus untuk pengguna yang sudah login. Silahkan login dulu 😉"}
      primaryCta={{
        label: "Login",
        href: "/login",
      }}
      secondaryCta={{
        label: "Kembali ke Beranda",
        href: "/",
      }}
      illustration={<LockedIllustration className="w-48 h-40 animate-float" />}
    />
  );
};

export default Error401;
