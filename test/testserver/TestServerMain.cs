using System;
using System.Threading.Tasks;
using Grpc.Core;
using Tsgrpc.Testserver;

namespace testserver
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var host = System.Environment.GetEnvironmentVariable("HOST") ?? "localhost";
            var port = int.Parse(System.Environment.GetEnvironmentVariable("PORT") ?? "50051");

            var tcs = new TaskCompletionSource();
            Console.CancelKeyPress += (sender, o) => {
                tcs.SetResult();
            };

            Server server = new Server
            {
                Services = { FooApi.BindService(new FooImpl()) },
                Ports = { new ServerPort(host, port, ServerCredentials.Insecure) }
            };
            server.Start();

            Console.WriteLine($"Foo API server listening on {host}:{port}");
            Console.WriteLine("Press Ctrl+C stop the server...");

            await tcs.Task;

            server.ShutdownAsync().Wait();
        }
    }

    class FooImpl : FooApi.FooApiBase {
        public override async Task GetTime(TimeRequest request, IServerStreamWriter<TimeUpdateReply> responseStream, ServerCallContext context)
        {
            Console.WriteLine($"Request: GetTime(interval = {request.IntervalSeconds})");
            var interval = request.IntervalSeconds == default ? 60 : request.IntervalSeconds;
            for (;;) {
                var timeString = DateTimeOffset.Now.ToString();
                await responseStream.WriteAsync(new TimeUpdateReply {
                    CurrentTimeString = timeString,
                });
                Console.WriteLine($"Sending time update: {timeString}");
                await Task.Delay(interval);
            }
        }

        public override Task<HelloReply> SayHello(HelloRequest request, ServerCallContext context)
        {
            var name = request.Name;
            Console.WriteLine($"Request: SayHello ({name})");
            var message = $"Hello, {name}! -from FooApi";
            Console.WriteLine($"Responding: {message}");
            return Task.FromResult(new HelloReply {
                Message = message,
            });
        }
    }
}
