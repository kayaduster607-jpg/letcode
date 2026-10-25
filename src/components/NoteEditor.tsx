'use client';

import { useNotes } from '@/hooks/useNotes';

interface NoteEditorProps {
  problemId: number;
}

export default function NoteEditor({ problemId }: NoteEditorProps) {
  const { note, updateNote, saveNow, isSaving } = useNotes(problemId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">我的笔记</h3>
        {isSaving && <span className="text-xs text-gray-400">保存中...</span>}
      </div>
      <textarea
        value={note}
        onChange={(e) => updateNote(e.target.value)}
        onBlur={saveNow}
        placeholder="在这里写下你的思考、总结、疑问..."
        className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
