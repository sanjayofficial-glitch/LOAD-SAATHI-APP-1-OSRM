export function generateWhatsAppLink(
  truckerPhone: string,
  details: {
    id: string;
    cargo_type?: string;
    goods_description?: string;
    pickup_city: string;
    drop_city: string;
    weight: number;
  }
): string {
  const cargo = details.cargo_type || details.goods_description || 'Cargo';
  const phone = truckerPhone.replace(/\D/g, '');
  const msg = encodeURIComponent(
    `Hello,\n\nI found your trip on LoadSaathi.\n\n` +
    `Cargo: ${cargo}\n` +
    `Pickup: ${details.pickup_city}\n` +
    `Drop: ${details.drop_city}\n` +
    `Weight: ${details.weight} kg\n` +
    `ID: LS-${details.id.slice(0, 8).toUpperCase()}\n\n` +
    `Can we discuss availability?`
  );
  return `https://wa.me/${phone}?text=${msg}`;
}
