import React, { useState, useEffect } from 'react';
import { Moon, Star, Calendar, Plus, Search, BarChart3, Download, Upload, Trash2, Edit, Save, X } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dreams');
  const [dreams, setDreams] = useState([]);
  const [lifeEvents, setLifeEvents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    mood: 'neutral',
    type: 'dream'
  });

  // PWA Manifest setup
  useEffect(() => {
    const manifestData = {
      "name": "Dream Diary & Life Tracker",
      "short_name": "Dream Diary",
      "icons": [{
        "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI0OCIgeT0iNDgiIHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CjxwYXRoIGQ9Im0xMiAzLTEuOTEyIDUuODEzYTIgMiAwIDAgMS0xLjA5NSAxLjA5NUwzIDEyIDguOTA1IDEzLjA5MmEyIDIgMCAwIDEgMS4wOTUgMS4wOTVMMTIgMjFsMS45MTItNS44MTNhMiAyIDAgMCAxIDEuMDk1LTEuMDk1TDIxIDEyLTE1LjA5NSAxMC45MDhhMiAyIDAgMCAxLTEuMDk1LTEuMDk1TDEyIDN6Ci8+CjxwYXRoIGQ9Ik0yIDJ2MyIvPgo8cGF0aCBkPSJtMjIgMnYzIi8+CjxwYXRoIGQ9Im0yMiAyMnYtMyIvPgo8cGF0aCBkPSJtMiAyMnYtMyIvPgo8L3N2Zz4KPC9zdmc+",
        "sizes": "192x192",
        "type": "image/svg+xml"
      }],
      "start_url": "/",
      "display": "standalone",
      "theme_color": "#6366F1",
      "background_color": "#F9FAFB"
    };
    
    const manifestBlob = new Blob([JSON.stringify(manifestData)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = manifestURL;
    document.head.appendChild(manifestLink);

    return () => {
      document.head.removeChild(manifestLink);
      URL.revokeObjectURL(manifestURL);
    };
  }, []);

  // Load data from memory on component mount
  useEffect(() => {
    const savedDreams = JSON.parse(localStorage.getItem('dreamDiary_dreams') || '[]');
    const savedEvents = JSON.parse(localStorage.getItem('dreamDiary_events') || '[]');
    const savedConnections = JSON.parse(localStorage.getItem('dreamDiary_connections') || '[]');
    
    setDreams(savedDreams);
    setLifeEvents(savedEvents);
    setConnections(savedConnections);
  }, []);

  // Save data whenever state changes
  useEffect(() => {
    localStorage.setItem('dreamDiary_dreams', JSON.stringify(dreams));
  }, [dreams]);

  useEffect(() => {
    localStorage.setItem('dreamDiary_events', JSON.stringify(lifeEvents));
  }, [lifeEvents]);

  useEffect(() => {
    localStorage.setItem('dreamDiary_connections', JSON.stringify(connections));
  }, [connections]);

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newEntry = {
      id: editingId || Date.now(),
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: editingId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      if (formData.type === 'dream') {
        setDreams(prev => prev.map(d => d.id === editingId ? newEntry : d));
      } else {
        setLifeEvents(prev => prev.map(e => e.id === editingId ? newEntry : e));
      }
    } else {
      if (formData.type === 'dream') {
        setDreams(prev => [...prev, newEntry]);
      } else {
        setLifeEvents(prev => [...prev, newEntry]);
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      tags: '',
      mood: 'neutral',
      type: activeTab === 'dreams' ? 'dream' : 'event'
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEdit = (entry) => {
    setFormData({
      ...entry,
      tags: entry.tags.join(', '),
      type: entry.type || (activeTab === 'dreams' ? 'dream' : 'event')
    });
    setEditingId(entry.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setDreams(prev => prev.filter(d => d.id !== id));
      setLifeEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const exportData = () => {
    const data = {
      dreams,
      lifeEvents,
      connections,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dream-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.dreams) setDreams(data.dreams);
          if (data.lifeEvents) setLifeEvents(data.lifeEvents);
          if (data.connections) setConnections(data.connections);
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getFilteredEntries = () => {
    const entries = activeTab === 'dreams' ? dreams : lifeEvents;
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getStats = () => {
    const totalDreams = dreams.length;
    const totalEvents = lifeEvents.length;
    const totalConnections = connections.length;
    
    const dreamsByMood = dreams.reduce((acc, dream) => {
      acc[dream.mood] = (acc[dream.mood] || 0) + 1;
      return acc;
    }, {});

    const recentActivity = [...dreams, ...lifeEvents]
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      }).length;

    return {
      totalDreams,
      totalEvents,
      totalConnections,
      dreamsByMood,
      recentActivity
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Moon className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Dream Diary & Life Tracker</h1>
          </div>
          <p className="text-gray-600">Track your dreams and life events to discover meaningful connections</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('dreams')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              activeTab === 'dreams' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Moon className="w-4 h-4 mr-2" />
            Dreams ({dreams.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              activeTab === 'events' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Star className="w-4 h-4 mr-2" />
            Life Events ({lifeEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              activeTab === 'connections' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Connections ({connections.length})
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search dreams, events, or connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab === 'dreams' ? 'Dream' : 'Event'}
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </button>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <label className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
        </div>

        {/* Statistics Panel */}
        {showStats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{stats.totalDreams}</div>
                <div className="text-sm text-gray-600">Total Dreams</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.totalEvents}</div>
                <div className="text-sm text-gray-600">Life Events</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.totalConnections}</div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.recentActivity}</div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
            </div>
            
            {Object.keys(stats.dreamsByMood).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Dreams by Mood</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.dreamsByMood).map(([mood, count]) => (
                    <div key={mood} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {mood}: {count}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingId ? 'Edit' : 'Add'} {formData.type === 'dream' ? 'Dream' : 'Life Event'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData({...formData, mood: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="happy">Happy</option>
                    <option value="neutral">Neutral</option>
                    <option value="sad">Sad</option>
                    <option value="anxious">Anxious</option>
                    <option value="excited">Excited</option>
                    <option value="peaceful">Peaceful</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="lucid, flying, work, family"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {activeTab === 'connections' ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Connections Coming Soon</h3>
              <p className="text-gray-500">
                This feature will help you identify patterns and connections between your dreams and life events.
              </p>
            </div>
          ) : (
            <>
              {getFilteredEntries().length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Moon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Welcome to your Dream Diary!
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start by recording your dreams and life events to discover meaningful connections.
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First {activeTab === 'dreams' ? 'Dream' : 'Event'}
                  </button>
                </div>
              ) : (
                getFilteredEntries().map((entry) => (
                  <div key={entry.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{entry.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString()} • {entry.mood}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{entry.content}</p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;