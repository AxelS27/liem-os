import { HttpResponse, http } from 'msw';

export const handlers = [
  http.get('*/api/v1/health', () => {
    return HttpResponse.json({
      data: { status: 'ok' },
    });
  }),

  http.get('*/api/v1/notes', () => {
    return HttpResponse.json({
      data: {
        items: [
          {
            id: 'mock-1',
            title: 'Mocked Note 1',
            body: 'This is mocked by MSW.',
            createdAt: new Date().toISOString(),
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
      },
    });
  }),
];
