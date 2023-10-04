{
  description = "Node development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, flake-utils, nixpkgs }: let
    pkgs = import nixpkgs {
      system = "x86_64-linux";
      config = {
        allowUnfree = true;
      };
    };
    in {
      fhs_env = pkgs.buildFHSUserEnv {
        name = "fhs-env";
        targetPkgs = pkgs: [
          pkgs.nodejs-18_x
          pkgs.yarn
          pkgs.jq
        ];
      };
    };

    # instead of duplicating the same configuration for every system
    # eachDefaultSystem will iterate over the default list of systems
    # and then map the outputs of devShells = { default } to devShells = { <system> = default }
    # 
#    flake-utils.lib.eachDefaultSystem
#      (system: let
#        pkgs = import nixpkgs {
#          system = system;
#          config = {
#            allowUnfree = true;
#          };
#        };
#        #pkgs = nixpkgs.legacyPackages.x86_64-linux;
#        #fhsEnv = nixpkgs.stdenv.mkDerivation {
#        #  name = "fhs-env";
#        #  buildInputs = [ ];
#        #  buildCommand = "mkdir -p $out";
#        #};
#        in {
#          devShells = {
#            default = pkgs.mkShellNoCC {
#              buildInputs = [
#                # put packages for development shells here
#                pkgs.nodejs-18_x
#                pkgs.yarn
#                pkgs.jq
#              ];
#
#              shellHook = ''
#                export PS1="(tsgrpc-dev) $PS1"
#                export HISTFILE="$(realpath .)/.bash_history"
#              '';
#            };
#          };
#        }
#      );
}
