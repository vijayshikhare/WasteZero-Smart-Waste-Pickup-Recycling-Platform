import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function Chat() {
  const { userId } = useParams(); // may be undefined when just visiting /chat

  const { api, user } = useAuth();
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // partner info
        const ures = await api.get(`/api/user/${userId}`);
        setPartner(ures.data.user);
        // conversation
        const mres = await api.get(`/api/messages/${userId}`);
        setMessages(mres.data.messages || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId, api]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <p className="text-gray-700 text-lg">No conversation selected.</p>
          <p className="text-gray-500">Use the application or NGO pages to start a chat.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behaviour: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMsg.trim();
    if (!trimmed) return;
    try {
      const res = await api.post('/api/messages', {
        receiver_id: userId,
        content: trimmed,
      });
      setMessages((prev) => [...prev, res.data.message]);
      setNewMsg('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Link to="/dashboard/opportunities" className="mr-4 text-green-600 hover:underline">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-semibold">
          Chat with {partner?.name || 'User'}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user._id;
          return (
            <div
              key={msg._id}
              className={`max-w-[70%] ${isMe ? 'ml-auto bg-green-100 text-gray-900' : 'bg-white text-gray-800'} rounded-xl p-3 shadow`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="bg-white p-4 border-t flex items-center">
        <input
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
        >
          Send
        </button>
      </form>
    </div>
  );
}
