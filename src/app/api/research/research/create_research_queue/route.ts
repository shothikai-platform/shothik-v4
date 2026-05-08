import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { chat: chatId, query, config } = await request.json();

        // Input validation
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        if (query.length > 5000) {
            return NextResponse.json({ error: 'Query is too long' }, { status: 400 });
        }

        await dbConnect();

        // 1. Validate chat exists and user owns it (IDOR protection)
        const chat = await ResearchChat.findOne({
            _id: chatId,
            userId: user._id || user.id
        });

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // 2. Add User Message
        chat.messages.push({
            role: 'user',
            content: query,
            timestamp: new Date()
        });
        await chat.save();

        // 3. Mock Streaming
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendStep = (data: any) => {
                    controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
                };

                const jobId = `job-${Date.now()}`;

                try {
                    // Initial ack
                    sendStep({ step: 'init', data: { jobId, message: "Research started" } });
                    await new Promise(r => setTimeout(r, 600));

                    // Step 1: Query Plans
                    sendStep({ step: 'planning', data: { message: "Generating search queries..." } });
                    await new Promise(r => setTimeout(r, 800));

                    // Step 2: Searching
                    sendStep({ step: 'searching', data: { message: "Searching the web...", queries: [query] } });
                    await new Promise(r => setTimeout(r, 1200));

                    // Step 3: Synthesis
                    sendStep({ step: 'synthesizing', data: { message: "Synthesizing results..." } });
                    await new Promise(r => setTimeout(r, 800));

                    // Step 4: Complete
                    const mockResult = `Here is a research summary for "${query}". \n\nBased on the analysis, we found key insights... \n1. Insight A \n2. Insight B`;
                    const mockSources = [
                        { title: "Source 1", url: "https://example.com/1" },
                        { title: "Source 2", url: "https://example.com/2" }
                    ];

                    sendStep({
                        step: 'completed',
                        data: {
                            result: mockResult,
                            sources: mockSources,
                            images: []
                        }
                    });

                    // Update DB with Assistant Message
                    await ResearchChat.findOneAndUpdate(
                        { _id: chatId, userId: user._id || user.id },
                        {
                            $push: {
                                messages: {
                                    role: 'assistant',
                                    content: mockResult,
                                    timestamp: new Date(),
                                    metadata: { sources: mockSources }
                                }
                            }
                        }
                    );


                } catch (e) {
                    console.error("Streaming error", e);
                    sendStep({ step: 'error', error: "Simulation failed" });
                }

                controller.close();
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
