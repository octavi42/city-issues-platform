"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { CSSProperties, useState, useEffect, useRef } from "react";
import '@/components/examples/Page/ExamplePage.css';
import '@/components/examples/Page/Page.css';
import './page.css';
import { ExampleSheetWithStacking } from '@/components/examples/SheetWithStacking/ExampleSheetWithStacking';
import Category from '@/components/pages/Category';

export default function CategoryPage() {
  return (
    <Category />
  );
} 