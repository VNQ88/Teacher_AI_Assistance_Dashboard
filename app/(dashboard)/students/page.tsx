'use client';

import { useState } from 'react';

const MOCK_STUDENTS = [
  { id: 1, name: 'Nguyen Van An', email: 'an.nv@student.edu', classroom: 'BIO401 - Class A', score: 8.5, status: 'Active' },
  { id: 2, name: 'Tran Thi Bich', email: 'bich.tt@student.edu', classroom: 'BIO401 - Class A', score: 7.2, status: 'Active' },
  { id: 3, name: 'Le Quoc Cuong', email: 'cuong.lq@student.edu', classroom: 'CS301 - Class B', score: 9.1, status: 'Active' },
  { id: 4, name: 'Pham Minh Duc', email: 'duc.pm@student.edu', classroom: 'CS301 - Class B', score: 6.8, status: 'Inactive' },
  { id: 5, name: 'Ho Thi Em', email: 'em.ht@student.edu', classroom: 'MATH201 - Class C', score: 8.9, status: 'Active' },
];

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.classroom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#191C1E] mb-1">Students</h1>
        <p className="text-[#6F7880] font-medium">View and manage student progress across all classrooms.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Students', value: MOCK_STUDENTS.length, icon: 'groups', color: 'text-[#00658D]', bg: 'bg-[#C6E7FF]/30' },
          { label: 'Active', value: MOCK_STUDENTS.filter(s => s.status === 'Active').length, icon: 'verified', color: 'text-[#006A62]', bg: 'bg-[#84F5E8]/30' },
          { label: 'Avg Score', value: (MOCK_STUDENTS.reduce((acc, s) => acc + s.score, 0) / MOCK_STUDENTS.length).toFixed(1), icon: 'leaderboard', color: 'text-[#4858AB]', bg: 'bg-[#DEE0FF]/30' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-ambient">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined ${stat.color}`} style={{ fontSize: '20px' }}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-extrabold text-[#191C1E]">{stat.value}</p>
            <p className="text-xs text-[#6F7880] font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-ambient overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#191C1E]">All Students</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7880]" style={{ fontSize: '16px' }}>search</span>
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#F7F9FB] rounded-xl text-sm text-[#191C1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/30 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F9FB]">
                <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-6 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-4 py-3">Classroom</th>
                <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-4 py-3">Score</th>
                <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-t border-[#F2F4F6] hover:bg-[#F7F9FB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full signature-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#191C1E]">{student.name}</p>
                        <p className="text-xs text-[#6F7880]">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#6F7880]">{student.classroom}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#ECEEF0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full signature-gradient"
                          style={{ width: `${(student.score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#191C1E]">{student.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${student.status === 'Active' ? 'bg-[#84F5E8]/30 text-[#003934]' : 'bg-[#ECEEF0] text-[#6F7880]'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-[#006A62]' : 'bg-[#BEC8D0]'}`} />
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
