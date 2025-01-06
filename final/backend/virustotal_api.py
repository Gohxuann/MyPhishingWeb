from urllib import response
from flask import Flask, request, jsonify
import requests
import json
import time
import base64
import hashlib
from time import sleep
from pathlib import Path
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

API_KEY_IP = "your_api_key_here"
API_KEY_URL = "your_api_key_here"
API_KEY_FILE = "your_api_key_here"


def get_analysis_stats(stats):
    if stats is None:
        return "VirusTotal: No last analysis stats available."
    else:
        return {
            "malicious": stats["malicious"],
            "undetected": stats["undetected"],
            "harmless": stats["harmless"],
            "suspicious": stats["suspicious"],
            "timeout": stats["timeout"],
        }


def base64_url_encode(url):
    url_bytes = url.encode("utf-8")
    base64_bytes = base64.urlsafe_b64encode(url_bytes)
    return base64_bytes.decode("utf-8").rstrip("=")


def hash_it(file, algorithm):
    if algorithm == "sha256":
        hasher = hashlib.sha256()
    elif algorithm == "sha1":
        hasher = hashlib.sha1()
    elif algorithm == "md5":
        hasher = hashlib.md5()
    else:
        raise Exception(
            "Incompatible hash algorithm used. Choose from: sha256 | sha1 | md5"
        )

    with open(file, "rb") as f:
        hasher.update(f.read())
    return hasher.hexdigest()


def vt_get_data(f_hash, headers):
    url = f"https://www.virustotal.com/api/v3/files/{f_hash}"
    while True:
        response = requests.get(url, headers=headers)
        if error_handle(response):
            break
    return response


def vt_post_files(file, headers, url="https://www.virustotal.com/api/v3/files"):
    with open(file, "rb") as f:
        file_bin = f.read()
    upload_package = {"file": (file.name, file_bin)}
    while True:
        response = requests.post(url, headers=headers, files=upload_package)
        if error_handle(response):
            break
    return response


def vt_get_analyses(response, headers):
    _id = response.json().get("data").get("id")
    url = f"https://www.virustotal.com/api/v3/analyses/{_id}"
    while True:
        sleep(60)
        while True:
            response = requests.get(url, headers=headers)
            if error_handle(response):
                break
        if response.json().get("data").get("attributes").get("status") == "completed":
            f_hash = response.json().get("meta").get("file_info").get("sha256")
            return f_hash


def vt_get_upload_url(headers):
    url = "https://www.virustotal.com/api/v3/files/upload_url"
    while True:
        response = requests.get(url, headers=headers)
        if error_handle(response):
            break
    return response.json()["data"]


def error_handle(response):
    if response.status_code == 429:
        sleep(60)
    if response.status_code == 401:
        raise Exception("Invalid API key")
    elif response.status_code not in (200, 404, 429):
        raise Exception(response.status_code)
    else:
        return True
    return False


def parse_response(response):
    json_obj = response.json().get("data").get("attributes")

    output = {}

    output["name"] = json_obj.get("meaningful_name")
    output["stats"] = json_obj.get("last_analysis_stats")
    output["engine_detected"] = {}

    for engine in json_obj.get("last_analysis_results").keys():
        if (
            json_obj.get("last_analysis_results").get(engine).get("category")
            != "undetected"
        ):
            output.get("engine_detected")[engine] = {}
            output.get("engine_detected")[engine]["category"] = (
                json_obj.get("last_analysis_results").get(engine).get("category")
            )
            output.get("engine_detected")[engine]["result"] = (
                json_obj.get("last_analysis_results").get(engine).get("result")
            )

    output["votes"] = json_obj.get("total_votes")
    output["hash"] = {"sha1": json_obj.get("sha1"), "sha256": json_obj.get("sha256")}
    output["size"] = json_obj.get("size")
    return output


@app.route("/api", methods=["GET", "POST"])
def combined_route():
    malicious = "no"
    if request.method == "GET":
        # Your existing GET handling code
        if "ip" in request.args:
            ip_add = request.args.get("ip")
            if not ip_add:
                return jsonify({"error": "IP address is required"}), 400

            url = f"https://www.virustotal.com/api/v3/ip_addresses/{ip_add}"
            headers = {
                "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0",
                "x-apikey": API_KEY_IP,
            }

            response = requests.get(url, headers=headers)
            try:
                response_data = response.json()
            except ValueError:
                print("Response content:", response.text)
                return (
                    jsonify(
                        {
                            "error": "Failed to parse response from VirusTotal",
                            "content": response.text,
                        }
                    ),
                    500,
                )

            if "data" not in response_data or "attributes" not in response_data["data"]:
                print("Invalid response structure:", response_data)
                return (
                    jsonify({"error": "Invalid response structure from VirusTotal"}),
                    500,
                )

            dict_web = response_data["data"]["attributes"]["last_analysis_results"]
            tot_engine_c = 0
            tot_detect_c = 0
            result_eng = []
            eng_name = []

            for i in dict_web:
                tot_engine_c += 1
                if dict_web[i]["category"] in ["malicious", "suspicious"]:
                    result_eng.append(dict_web[i]["result"])
                    eng_name.append(dict_web[i]["engine_name"])
                    tot_detect_c += 1

            result_eng = list(set(result_eng))

            if tot_detect_c > 0:
                result = f"The IP {ip_add} was rated as {', '.join(result_eng)} on {tot_detect_c} engine(s) out of {tot_engine_c} engines. The engines which reported this are: {', '.join(eng_name)}."
                result = f"{Gemini(result)}"
                return jsonify(
                    {
                        "result": result,
                        "malicious": "yes",
                    }
                )
            else:
                result = (
                    f"The IP {ip_add} has been marked harmless and clean on VirusTotal."
                )

            return jsonify(result)

        ################## Scan URL ####################
        elif "url" in request.args:
            url = request.args.get("url")
            if not url:
                return jsonify({"error": "No URL provided"}), 400

            encoded_url = base64_url_encode(url)
            headers = {"x-apikey": API_KEY_URL}
            response = requests.get(
                f"https://www.virustotal.com/api/v3/urls/{encoded_url}", headers=headers
            )
            response_data = json.loads(response.text)

            if response.status_code == 200:
                attributes = response_data["data"]["attributes"]
                analysis_results = attributes[
                    "last_analysis_results"
                ]  # Detailed engine-wise results
                stats = attributes["last_analysis_stats"]  # Summary of detections

                # Extract malicious results
                malicious_engines = {
                    engine: result["result"]
                    for engine, result in analysis_results.items()
                    if result["category"] in ["malicious", "suspicious"]
                }
                malicious_count = len(malicious_engines)
                if malicious_count > 0:
                    malicious = "yes"

                # Create a summary for Gemini
                summary = f"""
                    VirusTotal URL Scan Summary:
                    - Total Malicious Engines: {stats['malicious']}
                    - Total Suspicious Engines: {stats['suspicious']}
                    - Total Engines Scanned: {sum(stats.values())}

                    Engines reporting malicious or suspicious results:
                    {', '.join([f'{engine}: {result}' for engine, result in malicious_engines.items()])}
                    """
                # Pass to Gemini for analysis
                gemini_response = Gemini(summary)
                return jsonify(
                    {
                        "result": gemini_response,
                        "malicious": malicious,
                    }
                )
            elif response.status_code == 404:
                headers = {
                    "x-apikey": API_KEY_URL,
                    "Content-Type": "application/x-www-form-urlencoded",
                }
                response = requests.post(
                    "https://www.virustotal.com/api/v3/urls",
                    headers=headers,
                    data=f"url={url}",
                )
                response_data = json.loads(response.text)

                if response.status_code == 200:
                    data_id = response_data["data"]["id"]

                    while True:
                        time.sleep(30)
                        response = requests.get(
                            f"https://www.virustotal.com/api/v3/analyses/{data_id}",
                            headers=headers,
                        )
                        response_data = json.loads(response.text)
                        if response.status_code == 200:
                            attributes = response_data["data"]["attributes"]
                            stats = attributes["stats"]
                            if attributes["status"] == "completed":
                                return jsonify(get_analysis_stats(stats))
                        else:
                            return jsonify(
                                {
                                    "error": f"Error occurred. Status code: {response.status_code}. Message: {response_data['error']['message']}"
                                }
                            )
                else:
                    return jsonify(
                        {
                            "error": f"Error occurred. Status code: {response.status_code}. Message: {response_data['error']['message']}"
                        }
                    )
            else:
                return jsonify(
                    {
                        "error": f"Error occurred. Status code: {response.status_code}. Message: {response_data['error']['message']}"
                    }
                )
    ###################### File Scanning ##############################
    elif request.method == "POST":
        if "file" in request.files:
            file = request.files["file"]
            if file.filename == "":
                return jsonify({"error": "No selected file"}), 400

            file_path = Path(file.filename).resolve()  # Make sure the path is absolute
            file.save(str(file_path))  # Convert Path object to string

            f_hash = hash_it(file_path, "sha256")

            headers = {"x-apikey": API_KEY_FILE}
            response = vt_get_data(f_hash, headers)

            if response.status_code == 404:
                if file_path.stat().st_size > 32000000:
                    response = vt_get_data(
                        vt_get_analyses(
                            vt_post_files(
                                file_path, headers, vt_get_upload_url(headers)
                            ),
                            headers,
                        ),
                        headers,
                    )
                else:
                    response = vt_get_data(
                        vt_get_analyses(vt_post_files(file_path, headers), headers),
                        headers,
                    )
                    
            response_data = json.loads(response.text)
            if response.status_code == 200:
                #     malicious_engines = {
                #         engine: result["result"]
                #         for engine, result in analysis_results.items()
                #         if result["category"] in ["malicious", "suspicious"]
                #     }
                # malicious_count = len(malicious_engines)
                # if malicious_count > 0:
                #     malicious = "yes"

                # parsed_response = parse_response(response)
                # # Prepare summary for Gemini
                # summary = f"""
                # VirusTotal File Analysis Report:
                # - File Name: {parsed_response.get('name', 'N/A')}
                # - Total Malicious Detections: {parsed_response['stats'].get('malicious', 0)}
                # - Total Harmless: {parsed_response['stats'].get('harmless', 0)}
                # - Total Suspicious: {parsed_response['stats'].get('suspicious', 0)}
                # - Engines Detected Malicious or Suspicious Results:
                # """
                # for engine, result in parsed_response.get(
                #     "engine_detected", {}
                # ).items():
                #     summary += (
                #         f"\n    - {engine}: {result['category']} ({result['result']})"
                #     )
                # # Send the summary to Gemini for explanation
                # gemini_response = Gemini(summary)
                # return jsonify(summary), 200
                attributes = response_data["data"]["attributes"]
                analysis_results = attributes[
                    "last_analysis_results"
                ]  # Detailed engine-wise results
                stats = attributes["last_analysis_stats"]  # Summary of detections

                # Extract malicious results
                malicious_engines = {
                    engine: result["result"]
                    for engine, result in analysis_results.items()
                    if result["category"] in ["malicious", "suspicious"]
                }
                malicious_count = len(malicious_engines)
                if malicious_count > 0:
                    malicious = "yes"

                # Create a summary for Gemini
                summary = f"""
                    VirusTotal File {file} Scan Summary:
                    - Total Malicious Engines: {stats['malicious']}
                    - Total Suspicious Engines: {stats['suspicious']}
                    - Total Engines Scanned: {sum(stats.values())}

                    Engines reporting malicious or suspicious results:
                    {', '.join([f'{engine}: {result}' for engine, result in malicious_engines.items()])}
                    """
                # Pass to Gemini for analysis
                gemini_response = Gemini(summary)
                return jsonify(
                    {
                        "result": gemini_response,
                        "malicious": malicious,
                    }
                )
            else:
                return jsonify({"error": response.status_code}), response.status_code

        return jsonify({"error": "Invalid request"}), 400


API_KEY = (
    "your_api_key_here"
)
URL = "https://www.abuseipdb.com/api/v2/report"


def report_phishing_ip(api_key, ip_address, categories, comment):
    headers = {"Accept": "application/json", "Key": api_key}
    data = {"ip": ip_address, "categories": categories, "comment": comment}

    response = requests.post(URL, headers=headers, data=data)
    return response


@app.route("/report-ip", methods=["POST"])
def report_ip():
    if request.method == "POST":
        ip_address = request.json.get("ip")
        categories = "14"  # Category for Phishing
        comment = "Phishing site detected"

        response = report_phishing_ip(API_KEY, ip_address, categories, comment)
        result = response.json()

        if response.status_code == 200:
            result = f"The IP address '{ip_address}' has been successfully reported for phishing."
            return jsonify(result), 200
        else:
            return (
                jsonify(
                    {
                        "error": f"Failed to report the IP address '{ip_address}'. The IP address probably already reported. Please wait for few minutes to try again."
                    }
                ),
                response.status_code,
            )

    return jsonify({"error": "Method not allowed"}), 405


api_key = "your_api_key_here"


@app.route("/report-url", methods=["POST"])
def report_url():
    if request.method == "POST":
        url_address = request.json.get("url")
        jsonData = {
            "anonymous": "0",
            "submission": [
                {
                    "url": url_address,
                    "threat": "malware_download",
                    "tags": ["Emotet", "doc"],
                }
            ],
        }

    headers = {"Content-Type": "application/json", "Auth-Key": api_key}

    try:
        # Send POST request
        r = requests.post(
            "https://urlhaus.abuse.ch/api/", json=jsonData, timeout=15, headers=headers
        )

        # Check HTTP status code
        if r.status_code == 200:
            result = f"The IP address '{url_address}' has been successfully reported as malicious url."
            return jsonify(result), 200
            # print("✅ URL successfully submitted to URLhaus!")
            # print("Response:", r.content.decode('utf-8'))  # Decode response for readability
        else:
            return (
                jsonify(
                    {
                        "error": f"Error Occurred. Status Code: {r.status_code}. Response: {r.content.decode('utf-8')}"
                    }
                ),
                response.status_code,
            )

    except requests.exceptions.RequestException as e:
        print(f"⚠️ Error sending request: {e}")

    return jsonify({"error": "Method not allowed"}), 405


def Gemini(text):
    genai.configure(api_key="your_api_key_here")
    model = genai.GenerativeModel("gemini-1.5-flash")
    explaination = (
        "Can you explain about the report in VirusTotal? The first paragraph of the report is the type of malicious, then second paragraph is the explanation of the report, third  paragraph is strategic to prevent. Format only with three bold text such as Type of Malicious,Explanation and Strategic. Dont't repeat this sentences, just start to your interpretation.\n"
        + text
    )
    response = model.generate_content(explaination)
    return response.text


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
