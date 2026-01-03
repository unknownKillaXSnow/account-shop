'use client';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Shop() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [newAccount, setNewAccount] = useState('');

  // 1. Fetch Stock
  useEffect(() => {
    fetch('/api/stock').then(res => res.json()).then(data => setProducts(data));
  }, []);

  // 2. Buy Handler (Stripe)
  const handleBuy = async (productId) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    const { url } = await res.json();
    window.location.href = url; // Send to Stripe
  };

  // 3. Admin Restock Handler
  const handleRestock = async () => {
    await fetch('/api/stock', {
      method: 'POST',
      body: JSON.stringify({ accountData: newAccount }),
    });
    alert('Account Added!');
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      {/* Header */}
      <nav className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">🛒 Account Shop</h1>
        
        {/* Discord Button */}
        <a href="YOUR_DISCORD_LINK" className="bg-indigo-600 text-white px-4 py-2 rounded">
          Join Discord
        </a>

        {/* Login/Logout */}
        {session ? (
          <button onClick={() => signOut()}>Sign Out</button>
        ) : (
          <button onClick={() => signIn('google')}>Admin Login</button>
        )}
      </nav>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-bold">{p.name}</h2>
            <p className="text-gray-500">${p.price}</p>
            <button 
              onClick={() => handleBuy(p.id)}
              className="mt-4 w-full bg-green-500 text-white py-2 rounded">
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* ADMIN PANEL (Only visible if email matches) */}
      {session?.user?.email === 'YOUR_ADMIN_EMAIL@gmail.com' && (
        <div className="mt-20 border-t-4 border-red-500 pt-10">
          <h2 className="text-2xl font-bold text-red-500">🔒 Admin Restock Panel</h2>
          <textarea 
            className="w-full border p-2 mt-4" 
            placeholder="Paste account details here (User:Pass)..."
            onChange={(e) => setNewAccount(e.target.value)}
          />
          <button onClick={handleRestock} className="bg-red-500 text-white px-6 py-2 mt-4 rounded">
            Add to Stock
          </button>
        </div>
      )}
    </div>
  );
}
