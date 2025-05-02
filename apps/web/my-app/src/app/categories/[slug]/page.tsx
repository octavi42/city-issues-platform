"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { CSSProperties, useState, useEffect, useRef } from "react";
import Category from '@/components/pages/Category';

export default function CategoryPage() {
  return <Category />;
}