import { NextResponse } from 'next/server';

const teams = [
  { id: 't1', name: 'Mumbai Indians', city: 'Mumbai' },
  { id: 't2', name: 'Chennai Super Kings', city: 'Chennai' },
  { id: 't3', name: 'Royal Challengers Bangalore', city: 'Bengaluru' },
  { id: 't4', name: 'Kolkata Knight Riders', city: 'Kolkata' },
  { id: 't5', name: 'Delhi Capitals', city: 'Delhi' },
  { id: 't6', name: 'Sunrisers Hyderabad', city: 'Hyderabad' },
];

export async function GET() {
  return NextResponse.json({ data: teams });
}
