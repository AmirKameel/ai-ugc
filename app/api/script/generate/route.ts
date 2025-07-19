import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { product_name, product_description, style = 'enthusiastic' } = await request.json();

    if (!product_name || !product_description) {
      return NextResponse.json(
        { error: 'product_name and product_description are required' },
        { status: 400 }
      );
    }

    // Generate a simple UGC script based on the product
    const script = generateUGCScript(product_name, product_description, style);

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}

function generateUGCScript(productName: string, description: string, style: string): string {
  const hooks = [
    "Okay, I have to share this with you because",
    "You guys, I'm obsessed with this",
    "I wasn't expecting this, but",
    "Can we talk about this for a second?",
  ];

  const transitions = [
    "Here's the thing -",
    "What I love about this is",
    "The best part?",
    "And honestly,",
  ];

  const closings = [
    "You need to try this!",
    "Seriously, check this out!",
    "Trust me on this one!",
    "You won't regret it!",
  ];

  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  const transition = transitions[Math.floor(Math.random() * transitions.length)];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  return `${hook} ${productName} literally changed everything for me. ${transition} ${description} I've been using it for a while now and the results are incredible. ${closing}`;
}