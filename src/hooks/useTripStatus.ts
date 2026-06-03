"use client";

import { useState } from 'react';

export function useTripStatus(initialStatus: string = 'pending') {
  const [tripStatus, setTripStatus] = useState(initialStatus);
  return { tripStatus, setTripStatus };
}