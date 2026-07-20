import { render } from "@testing-library/react";
import Hls from "hls.js";
import fetchMock from "jest-fetch-mock";
import * as VirtualVideo from "../VirtualVideo";

describe("isHlsUrl", () => {
  it("detects .m3u8 playlists, including ones with query params", () => {
    expect(VirtualVideo.isHlsUrl("https://example.com/stream/index.m3u8")).toBe(true);
    expect(VirtualVideo.isHlsUrl("https://example.com/stream/index.m3u8?token=abc123")).toBe(true);
    expect(VirtualVideo.isHlsUrl("/local/playlist.m3u")).toBe(true);
  });

  it("returns false for non-HLS urls", () => {
    expect(VirtualVideo.isHlsUrl("https://example.com/video.mp4")).toBe(false);
    expect(VirtualVideo.isHlsUrl("https://example.com/video.webm")).toBe(false);
  });
});

describe("canPlayUrl for HLS", () => {
  it("reports HLS playlists as playable when hls.js is supported", async () => {
    const spy = jest.spyOn(Hls, "isSupported").mockReturnValue(true);

    await expect(VirtualVideo.canPlayUrl("https://example.com/stream/index.m3u8")).resolves.toBe(true);

    spy.mockRestore();
  });

  it("reports HLS playlists as unplayable when neither native HLS nor hls.js is available", async () => {
    const spy = jest.spyOn(Hls, "isSupported").mockReturnValue(false);

    await expect(VirtualVideo.canPlayUrl("https://example.com/stream/index.m3u8")).resolves.toBe(false);

    spy.mockRestore();
  });
});

describe("VirtualVideo", () => {
  it("should call canPlayUrl and return false if no url specified", async () => {
    const canPlayType = jest.fn();

    render(<VirtualVideo.VirtualVideo canPlayType={canPlayType} />);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canPlayType).toHaveBeenCalledWith(false);
  });

  it("should call canPlayUrl and return true if valid url specified", async () => {
    const canPlayType = jest.fn();

    render(
      <VirtualVideo.VirtualVideo
        src="https://app.heartex.ai/static/samples/opossum_snow.mp4"
        canPlayType={canPlayType}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canPlayType).toHaveBeenCalledWith(true);
  });

  it("should call canPlayUrl and return true if valid relative url specified", async () => {
    const canPlayType = jest.fn();

    render(<VirtualVideo.VirtualVideo src="/files/opossum_intro.webm" canPlayType={canPlayType} />);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canPlayType).toHaveBeenCalledWith(true);
  });

  it("should call canPlayUrl and return true if valid url specified, even if content-type is binary/octet-stream", async () => {
    const canPlayType = jest.fn();

    // return binary/octet-stream for all requests, mimicking the situation where
    // the server doesn't set the content-type header and defaults to binary/octet-stream
    fetchMock.mockResponseOnce("", {
      headers: {
        "content-type": "binary/octet-stream",
      },
    });

    render(
      <VirtualVideo.VirtualVideo
        src="https://app.heartex.ai/static/samples/opossum_snow.mp4"
        canPlayType={canPlayType}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canPlayType).toHaveBeenCalledWith(true);
  });

  it("should call canPlayUrl and return true if valid file is specified, and content-type is binary/octet-stream but no file extension", async () => {
    const canPlayType = jest.fn();

    // return binary/octet-stream for all requests, mimicking the situation where
    // the server doesn't set the content-type header and defaults to binary/octet-stream
    fetchMock.mockResponseOnce("", {
      headers: {
        "content-type": "binary/octet-stream",
      },
    });

    render(
      <VirtualVideo.VirtualVideo src="https://app.heartex.ai/static/samples/opossum_snow" canPlayType={canPlayType} />,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canPlayType).toHaveBeenCalledWith(true);
  });

  it("should call canPlayUrl and return false if invalid url specified", async () => {
    const canPlayType = jest.fn();

    render(
      <VirtualVideo.VirtualVideo
        src="https://app.heartex.ai/static/samples/opossum_snow.avi"
        canPlayType={canPlayType}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canPlayType).toHaveBeenCalledWith(false);
  });

  it("should call canPlayUrl and return false if invalid url specified, even if content-type is binary/octet-stream", async () => {
    const canPlayType = jest.fn();

    // return binary/octet-stream for all requests, mimicking the situation where
    // the server doesn't set the content-type header and defaults to binary/octet-stream
    fetchMock.mockResponseOnce("", {
      headers: {
        "content-type": "binary/octet-stream",
      },
    });

    render(
      <VirtualVideo.VirtualVideo
        src="https://app.heartex.ai/static/samples/opossum_snow.avi"
        canPlayType={canPlayType}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canPlayType).toHaveBeenCalledWith(false);
  });
});
