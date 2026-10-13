import { Suspense } from "react";
import { headers } from "next/headers";
import DeviceGate from "@/components/DeviceGate";

async function Gate() {
  const ua = (await headers()).get("user-agent") ?? "";
  const initialIsMobile = /Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua) && !/iPad|Tablet/i.test(ua);
  return <DeviceGate initialIsMobile={initialIsMobile} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Gate />
    </Suspense>
  );
}
