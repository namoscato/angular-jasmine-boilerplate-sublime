import sublime, sublime_plugin
import os, sys, subprocess, traceback

try:
    import commands
except ImportError:
    pass

PLUGIN_FOLDER = os.path.dirname(os.path.realpath(__file__))
SETTINGS_FILE = "AngularJasmineBoilerplate.sublime-settings"
CONFIGURATION_KEY = "configurations"
OUTPUT_WRITING_FILES = "Writing boilerplate files...\n"
OUTPUT_ALREADY_EXISTS = "already exists"

class SetSourceFolderCommand(sublime_plugin.WindowCommand):
    def is_enabled(self, paths = []):
        return PluginUtils.is_dir(paths[0])

    def run(self, paths = []):
        PluginUtils.set_project_configuration_path(self.window, "base-path", paths[0])

class SetTestFolderCommand(sublime_plugin.WindowCommand):
    def is_enabled(self, paths = []):
        return PluginUtils.is_dir(paths[0])

    def run(self, paths = []):
        PluginUtils.set_project_configuration_path(self.window, "test-path", paths[0])

class AngularJasmineBoilerplateCommand(sublime_plugin.TextCommand):
    def is_enabled(self):
        file_name = self.view.file_name()
        return file_name.endswith(".js") or file_name.endswith(".ts")

    def run(self, edit):
        try:
            configuration = PluginUtils.get_project_configuration(self.view.window())

            base_path = configuration.get("base-path")
            test_path = configuration.get("test-path")

            if not base_path or not test_path:
                sublime.message_dialog("This project has not been configured for Jasmine boilerplate generation.\n\nRight click on the base and test folders to configure.")
                return

            output_files = AngularJasmineBoilerplateCommand.run_command(self, base_path, test_path)

            if output_files[0].find(OUTPUT_ALREADY_EXISTS) != -1: # TODO: Update when we support multiple files
                if sublime.ok_cancel_dialog("Boilerplate file " + output_files[0], "Overwrite"):
                    output_files = AngularJasmineBoilerplateCommand.run_command(self, base_path, test_path, True)
                else:
                    return

            for file in output_files:
                if file:
                    self.view.window().open_file(test_path + "/" + file)
        except:
            print("Unexpected error({0}): {1}".format(sys.exc_info()[0], sys.exc_info()[1]))
            traceback.print_tb(sys.exc_info()[2])
            sublime.message_dialog("Unable to generate Jasmine boilerplate.\n\nEnsure that the AngularJS service or controller is annotated correctly.")

    def run_command(self, base_path, test_path, force=False):
        """Runs the generate command with the specified base and test paths

        Args:
            base_path (str): Base path
            test_path (str): Test path
            force (Optional[boolean]): Optional force option. Defaults to False.

        Returns:
            List[str]: List of parsed output files
        """
        cmd = [
            PluginUtils.get_node_path(),
            PLUGIN_FOLDER + "/node_modules/angular-jasmine-boilerplate/bin/generate.js",
            "--base-path=" + base_path,
            "--test-path=" + test_path,
            "--force" if force else "--non-interactive",
            self.view.file_name()
        ]

        run = '"' + '" "'.join(cmd) + '"'
        output = subprocess.check_output(run, stderr=subprocess.STDOUT, shell=True, env=os.environ).decode("utf-8")

        output_files = output.split(OUTPUT_WRITING_FILES, 1)

        return output_files[1].split("\n")

class PluginUtils:
    @staticmethod
    def get_setting(key):
        return sublime.load_settings(SETTINGS_FILE).get(key)

    @staticmethod
    def set_setting(key, value):
        sublime.load_settings(SETTINGS_FILE).set(key, value)
        sublime.save_settings(SETTINGS_FILE)

    @staticmethod
    def get_configurations(window):
        project_folder = PluginUtils.get_project_folder(window)
        configurations = PluginUtils.get_setting(CONFIGURATION_KEY)

        if not configurations:
            configurations = {}

        if not configurations.get(project_folder):
            configurations[project_folder] = {}

        return configurations

    @staticmethod
    def get_project_configuration(window):
        project_folder = PluginUtils.get_project_folder(window)
        configurations = PluginUtils.get_configurations(window)

        return configurations[project_folder]

    @staticmethod
    def set_project_configuration_path(window, key, path):
        project_folder = PluginUtils.get_project_folder(window)
        configurations = PluginUtils.get_configurations(window)

        configurations[project_folder][key] = path

        PluginUtils.set_setting(CONFIGURATION_KEY, configurations)

    @staticmethod
    def get_node_path():
        platform = sublime.platform()
        node = PluginUtils.get_setting("node_path").get(platform)
        return node

    @staticmethod
    def get_project_folder(window):
        return window.extract_variables().get("folder")

    @staticmethod
    def is_dir(path):
        return os.path.isdir(path)
