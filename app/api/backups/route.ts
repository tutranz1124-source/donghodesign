import { NextRequest, NextResponse } from 'next/server';
import {
  getBackupSnapshots,
  restoreBackupSnapshot,
  getFullSystemBackup,
  restoreFullSystemBackup,
  createBackupSnapshot
} from '@/lib/storage';
import { verifyEditorSession, verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const isAuth = verifyEditorSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền xem bản sao lưu.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'export_full') {
    const fullBackup = getFullSystemBackup();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `donghoa-backup-full-${dateStr}.json`;

    return new NextResponse(JSON.stringify(fullBackup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  }

  const snapshots = getBackupSnapshots();
  return NextResponse.json({
    success: true,
    totalSnapshots: snapshots.length,
    snapshots
  });
}

export async function POST(request: NextRequest) {
  const isAuth = verifyEditorSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền thao tác sao lưu & khôi phục.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, fileName, backupData } = body;

    if (action === 'create_full_snapshot') {
      const full = getFullSystemBackup();
      const snapshotFileName = createBackupSnapshot('full', full, 'Sao lưu toàn diện thủ công');
      return NextResponse.json({
        success: true,
        message: 'Đã tạo bản sao lưu toàn diện thành công!',
        fileName: snapshotFileName
      });
    }

    if (action === 'restore_snapshot') {
      if (!fileName) {
        return NextResponse.json({ error: 'Thiếu tên file bản sao lưu cần khôi phục' }, { status: 400 });
      }
      const result = restoreBackupSnapshot(fileName);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (action === 'import_full') {
      if (!backupData || typeof backupData !== 'object') {
        return NextResponse.json({ error: 'Dữ liệu gói sao lưu không hợp lệ' }, { status: 400 });
      }
      const result = restoreFullSystemBackup(backupData);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: `Lỗi khi xử lý sao lưu: ${err.message}` }, { status: 500 });
  }
}
