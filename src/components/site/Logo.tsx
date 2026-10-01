import Image from 'next/image';

export function Logo() {
  return <Image className="brand-logo" src="/brand/hezb-logo-full.svg" alt="Hezb" width={118} height={38} priority unoptimized />;
}
